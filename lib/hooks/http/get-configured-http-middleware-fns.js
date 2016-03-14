/**
 * Module dependencies
 */

var Path = require('path');
var util = require('util');
var _ = require('lodash');



/**
 * getBuiltInHttpMiddleware()
 *
 * Return a dictionary containing all built-in middleware in Sails,
 * applying configuration along the way.
 *
 * @param  {Router} expressRouterMiddleware [i.e. `app.router`]
 * @param  {SailsApp} sails
 * @return {Dictionary}
 *         @property {Function} *
 *             @param {Request} req
 *             @param {Response} res
 *             @param {Function} next
 */
module.exports = function getBuiltInHttpMiddleware (expressRouterMiddleware, sails) {

  // Note that the environment of a Sails app is officially determined by
  // `sails.config.environment`. Normally, that is identical to what you'll
  // find inside `process.env.NODE_ENV`.
  //
  // However it is possible for NODE_ENV and `sails.config.environment to vary
  // (e.g. `sails.config.environment==='staging'` and `process.env.NODE_ENV==='production'`).
  //
  // Some middleware _depends on the NODE_ENV environment variable_ to determine
  // its behavior.  Since NODE_ENV may have been set automatically, this is why the
  // relevant requires are included _within_ this function, rather than up top.
  //
  // This is also why the NODE_ENV environment variable is used here to determine
  // whether or not to consider the app "in production".  This way, if you set
  // `NODE_ENV=production` explicitly, you can still use something like "staging"
  // or "sandbox" for your `sails.config.environment` in order to take advantage
  // of env-specific config files; while still having dependencies work like they
  // will in production (since NODE_ENV is set).
  //
  var IS_NODE_ENV_PRODUCTION = (process.env.NODE_ENV === 'production');



  return _.defaults(sails.config.http.middleware || {}, {

    // Configure flat file server to serve static files
    // (By default, all explicit+shadow routes take precedence over flat files)
    www: (function() {
      var flatFileMiddleware = require('serve-static')(sails.config.paths['public'], {
        maxAge: sails.config.http.cache
      });

      return flatFileMiddleware;
    })(),

    // If a Connect session store is configured, hook it up to Express
    session: (function() {
      if (sails.config.session && sails.config.session.store) {
        var configuredSessionMiddleware;
        try {
          // Set "resave" and "saveUninitialized" options or else express-session gives you a stern warning.
          var opts = _.merge({
            resave: true,
            saveUninitialized: true
          }, sails.config.session);
          configuredSessionMiddleware = require('express-session')(opts);
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


    // Build configured favicon mwr function.
    favicon: (function (){
      var toServeFavicon = require('serve-favicon');
      var pathToDefaultFavicon = Path.resolve(__dirname,'./default-favicon.ico');
      var serveFaviconMwr = toServeFavicon(pathToDefaultFavicon);
      return serveFaviconMwr;
    })(),


    /**
     * Track request start time as soon as possible
     *
     * We also might consider including connect.logger by default
     * (https://github.com/senchalabs/connect/blob/master/lib/middleware/logger.js)
     *
     * Or morgan.
     */
    startRequestTimer: !IS_NODE_ENV_PRODUCTION && function startRequestTimer(req, res, next) {
      req._startTime = new Date();
      next();
    },

    cookieParser: (function() {
      // backwards compatibility for old express.cookieParser config
      var cookieParser =
        sails.config.http.cookieParser || sails.config.http.middleware.cookieParser;
      var sessionSecret = sails.config.session && sails.config.session.secret;

      // If available, Sails uses the configured session secret for signing cookies.
      if (sessionSecret) {
        // Ensure secret is a string.  This check happens in the session hook as well,
        // but sails.config.session.secret may still be provided even if the session hook
        // is turned off, so to be extra anal we'll check here as well.
        if (!_.isString(sessionSecret)) {
          throw new Error('If provided, sails.config.session.secret should be a string.');
        }
        return cookieParser && cookieParser(sessionSecret);
      }
      // If no session secret was provided in config
      // (e.g. if session hook is disabled and config/session.js is removed)
      // then we do not enable signed cookies by providing a cookie secret.
      // (note that of course signed cookies can still be enabled in a Sails app:
      // see conceptual docs on disabling the session hook for info)
      else {
        return cookieParser && cookieParser();
      }
    })(),

    compress: IS_NODE_ENV_PRODUCTION && require('compression')(),

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
      var bodyParserFailureErrorMsg = 'Unable to parse HTTP body- error occurred :: ' + util.inspect((err&&err.stack)?err.stack:err, false, null);
      sails.log.error(bodyParserFailureErrorMsg);
      if (IS_NODE_ENV_PRODUCTION && sails.config.keepResponseErrors !== true) {
        return res.send(400);
      }
      return res.send(400, bodyParserFailureErrorMsg);
    },


    // Allow simulation of PUT and DELETE HTTP methods for user agents
    // which don't support it natively (looks for a `_method` param)
    methodOverride: (function() {
      if (sails.config.http.methodOverride) {
        return sails.config.http.methodOverride();
      }
    })(),

    // This is the Express router middleware.
    // When it runs, it matches incoming requests against all of this Sails app's
    // explicit routes and shadows.
    router: expressRouterMiddleware,

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
