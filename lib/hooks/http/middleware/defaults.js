/**
 * Module dependencies
 */

var _ = require('lodash'),
  util = require('util'),
  fs = require('fs'),
  path = require('path'),
  compression = require('compression'),
  serveFavicon = require('serve-favicon');



module.exports = function(sails, app) {

  //
  // !!! IMPORTANT !!!
  // `require('express')` is in here on purpose.
  // (i.e. if we `require` this above w/ everything else,
  // the NODE_ENV might not be set properly yet, and express
  // might think it's in a different env than it actually is)
  var express = require('express');
  var session = require('express-session');
  var IS_PRODUCTION = process.env.NODE_ENV === 'production';

  return _.defaults(sails.config.http.middleware || {}, {

    // Configure flat file server to serve static files
    // (By default, all explicit+shadow routes take precedence over flat files)
    www: (function() {
      var flatFileMiddleware = express['static'](sails.config.paths['public'], {
        maxAge: sails.config.http.cache
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
        var configuredSessionMiddleware;
        try {
          configuredSessionMiddleware = session(sails.config.session);
        }
        catch (e) {
          sails.log.error('Error occurred while setting up session middleware:',e);
          return undefined;
        }
        return function (req, res, next){
          configuredSessionMiddleware(req,res,function (err) {
            if (!err) {
              return next();
            }
            var errMsg = 'Error occurred in session middleware :: ' + util.inspect((err&&err.stack)?err.stack:err, false, null);
            sails.log.error(errMsg);
            return res.send(400, errMsg);
          });
        };
      }
    })(),

    // Default Express favicon.
    // NOTE: We use a default built-in favicon in case
    // the default favicon inside the application is missing.
    // If we don't, the application crashes since Express definitely want one.
    // Also, we use `process.cwd()` instead of `sails.config.appPath` here
    // to not have any conflicts with user modules and plugins.
    favicon: serveFavicon(
        fs.exists(path.resolve(process.cwd(), '.tmp', 'favicon.ico')) ?
                    path.resolve(process.cwd(), '.tmp', 'favicon.ico') :
                    path.resolve(__dirname, '..', 'assets', 'favicon.ico')
    ),

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
      // backwards compatibility for old express.cookieParser config
      var cookieParser =
        sails.config.http.cookieParser || sails.config.http.middleware.cookieParser;
      var sessionSecret = sails.config.session && sails.config.session.secret;

      // If session config does not exist, don't throw an error, just set to undefined.
      return cookieParser && cookieParser(sessionSecret);
    })(),

    csrf: (function(){
      if (_.isObject(sails.config.csrf) && sails.config.csrf.protectionEnabled) {
        var csrf = require('csurf');
        var csrfProtection = csrf(sails.config.csrf);
        return [csrfProtection, function badCSRFTokenHandler(err, req, res, next){
          if(err.code === 'EBADCSRFTOKEN'){
            if(sails.hooks.csrf) return sails.hooks.csrf.invalidToken(err, req, res, next);
          }
          return next();
        }];
      }
      return false;
    })(),

    compress: IS_PRODUCTION && compression(),

    // Use body parser, if enabled
    bodyParser: (function() {

      var opts = {};
      var fn;

      // Handle original bodyParser config:
      ////////////////////////////////////////////////////////
      // If a body parser was configured, use it
      if (sails.config.http.bodyParser) {
        fn = sails.config.http.bodyParser;
        return fn(opts);
      } else if (sails.config.http.bodyParser === false) {
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
          var configuredFn;

          try {
            configuredFn = fn(opts);
          }
          catch (e) {
            sails.on('lifted', function () {
              sails.log.error(e);
              sails.log.blank();
              sails.log.error('Encountered an error when trying to use configured bodyParser.');
              sails.log.error('Usually, this means that it was installed incorrectly.');
              sails.log.error('A custom bodyParser can be configured without calling the wrapper function- e.g.:\n'+
                '```\n'+
                'bodyParser: require("connect-busboy")\n'+
                '```'
              );
              sails.log.error(
              'Alternatively, if you need to provide options:\n'+
              '```\n'+
              'bodyParser: {\n'+
              '  fn: require("connect-busboy"),\n'+
              '  options: {/* ... */}\n'+
              '}\n'+
              '```');
            });
          }
          return configuredFn;
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

    // Should be installed immediately after the bodyParser- prevents bubbling to
    // the default error handler which will attempt to use body parameters, which may
    // cause unexpected issues.
    //
    // (included here so it still protects against this edge case if bodyParser
    // is overridden in userland.  Should probably be phased out at some point,
    // since it could be accomplished more elegantly- btu for now it's practical.)
    handleBodyParserError: function handleBodyParserError(err, req, res, next) {
      if (IS_PRODUCTION && sails.config.keepResponseErrors !== true) {
        return res.send(400);
      }
      var bodyParserFailureErrorMsg = 'Unable to parse HTTP body- error occurred :: ' + util.inspect((err&&err.stack)?err.stack:err, false, null);
      sails.log.error(bodyParserFailureErrorMsg);
      return res.status(400).send(bodyParserFailureErrorMsg);
    },


    // Allow simulation of PUT and DELETE HTTP methods for user agents
    // which don't support it natively (looks for a `_method` param)
    methodOverride: (function() {
      if (sails.config.http.methodOverride) {
        return sails.config.http.methodOverride();
      }
    })(),

    // Add powered-by Sails header
    poweredBy: function xPoweredBy(req, res, next) {
      res.header('X-Powered-By', 'Sails <sailsjs.org>');
      next();
    }

  });
};
