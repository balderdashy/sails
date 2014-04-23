/**
 * Module dependencies
 */

var _ = require('lodash'),
  util = require('util');



module.exports = function(sails, app) {

  //
  // !!! IMPORTANT !!!
  // `require('express')` is in here on purpose.
  // (i.e. if we `require` this above w/ everything else,
  // the NODE_ENV might not be set properly yet, and express
  // might think it's in a different env than it actually is)
  var express = require('express');
  var IS_PRODUCTION = process.env.NODE_ENV === 'production';

  return _.defaults(sails.config.express.middleware || {}, {

    // Configure flat file server to serve static files
    // (By default, all explicit+shadow routes take precedence over flat files)
    www: (function() {
      var flatFileMiddleware = express['static'](sails.config.paths['public'], {
        maxAge: sails.config.cache.maxAge
      });

      // Make some MIME type exceptions for Google fonts
      express['static'].mime.define({
        'application/font-woff': ['woff']
      });

      return flatFileMiddleware;
    })(),

    // If a Connect session store is configured, hook it up to Express
    session: (function() {
      if (sails.config.session && sails.config.session.store) {
        return express.session(sails.config.session);
      }
    })(),

    favicon: express.favicon(),

    /**
     * Track request start time as soon as possible
     *
     * TODO: consider including connect.logger by default
     * (https://github.com/senchalabs/connect/blob/master/lib/middleware/logger.js)
     */
    startRequestTimer: !IS_PRODUCTION && function startRequestTimer(req, res, next) {
      req._startTime = new Date();
      next();
    },

    cookieParser: (function() {
      var cookieParser = sails.config.express.cookieParser;
      var sessionSecret = sails.config.session.secret;
      return cookieParser(sessionSecret);
    })(),

    compress: IS_PRODUCTION && express.compress(),

    // Use body parser, if enabled
    bodyParser: (function() {

      var opts = {};
      var fn;

      // Handle original bodyParser config:
      ////////////////////////////////////////////////////////
      // If a body parser was configured, use it
      if (sails.config.express.bodyParser) {
        fn = sails.config.express.bodyParser;
        return fn(opts);
      } else if (sails.config.express.bodyParser === false) {
        // Allow for explicit disabling of bodyParser using traditional
        // `express.bodyParser` conf
        return undefined;
      }

      // Handle new middleware config:
      ////////////////////////////////////////////////////////
      var conf = sails.config.http.middleware.bodyParser;
      if (conf) {
        // middleware provided with options
        if (typeof conf === 'object') {
          opts = conf.options || opts;
          fn = conf.fn;
          return fn(opts);
        }
        // middleware function defined directly
        else if (typeof conf === 'function') {
          fn = conf;
          return fn(opts);
        }
        // invalid conf - warn and ignore
        else {
          // TODO: pull this out into a more generic config validator for Sails in general
          sails.log.warn(
            'Invalid `http.middleware.bodyParser` config: `' + conf + '`',
            'Proper usage:\n' +
            '{ options: {}, fn: function () {} }'
          );
        }
      }

      // Default to built-in bodyParser:
      fn = require('skipper');
      return fn(opts);

    })(),

    // Should be installed immediately after the bodyParser.
    handleBodyParserError: function handleBodyParserError(err, req, res, next) {
      sails.log.error('Unable to parse HTTP body- error occurred:');
      sails.log.error(err);
      return res.send(400, 'Unable to parse HTTP body- error occurred :: ' + util.inspect(err));
    },

    // Allow simulation of PUT and DELETE HTTP methods for user agents
    // which don't support it natively (looks for a `_method` param)
    methodOverride: (function() {
      if (sails.config.express.methodOverride) {
        return sails.config.express.methodOverride();
      }
    })(),

    // By default, the express router middleware is installed towards the end.
    // This is so that all the built-in core Express/Connect middleware
    // gets called before matching any explicit routes or implicit shadow routes.
    router: app.router,

    // Add powered-by Sails header
    poweredBy: function xPoweredBy(req, res, next) {
      res.header('X-Powered-By', 'Sails <sailsjs.org>');
      next();
    },

    // 404 and 500 middleware should be attached at the very end
    // (after `router`, `www`, and `favicon`)
    404: function handleUnmatchedRequest(req, res, next) {

      // Explicitly ignore error arg to avoid inadvertently
      // turning this into an error handler
      sails.emit('router:request:404', req, res);
    },
    500: function handleError(err, req, res, next) {
      sails.emit('router:request:500', err, req, res);
    }
  });
};
