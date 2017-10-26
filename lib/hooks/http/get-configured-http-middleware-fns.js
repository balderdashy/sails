/**
 * Module dependencies
 */

var Path = require('path');
var util = require('util');
var flaverr = require('flaverr');
var _ = require('@sailshq/lodash');



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
      // Silently do nothing if there's no session hook.
      // You can still have session middleware without the session hook enabled,
      // you just have to provide it yourself by configuring sails.config.http.middleware.session.
      if (!sails.hooks.session) {
        sails.log.verbose('Cannot load default HTTP session middleware when Sails session hook is disabled.  Skipping...');
        return;
      }
      // Complain a bit louder if the session hook is enabled, but not configured.
      if (!sails.config.session) {
        sails.log.error('Cannot load default HTTP session middleware without `sails.config.session` configured.  Skipping...');
        return;
      }

      var configuredSessionMiddleware = sails._privateSessionMiddleware;

      return function session(req, res, next){

        // --•
        // Run the session middleware.
        configuredSessionMiddleware(req,res,function (err) {
          if (!err) {
            return next();
          }

          var errMsg = 'Error occurred in session middleware :: ' + util.inspect((err&&err.stack)?err.stack:err, false, null);
          sails.log.error(errMsg);

          // If headers have already been sent (e.g. because of timing issues in application-level code),
          // then don't attempt to send another response.
          // (but still log a warning)
          if (res.headersSent) {
            sails.log.warn('The session middleware encountered an error and triggered its callback, but response headers have already been sent.  Rather than attempting to send another response, failing silently...');
            return;
          }

          // --•
          // Otherwise, we can go ahead and send a response.
          return res.status(400).send(errMsg);
        });
      };

    })(),


    // Build configured favicon mwr function.
    favicon: (function (){
      var toServeFavicon = require('serve-favicon');
      var pathToDefaultFavicon = Path.resolve(__dirname,'./default-favicon.ico');
      var serveFaviconMwr = toServeFavicon(pathToDefaultFavicon);
      return serveFaviconMwr;
    })(),


    cookieParser: (function() {

      var cookieParser = sails.config.http.middleware.cookieParser;
      if (!cookieParser) {
        cookieParser = require('cookie-parser');
      }

      var sessionSecret = sails.config.session && sails.config.session.secret;

      // If available, Sails uses the configured session secret for signing cookies.
      if (sessionSecret) {
        // Ensure secret is a string.  This check happens in the session hook as well,
        // but sails.config.session.secret may still be provided even if the session hook
        // is turned off, so to be extra anal we'll check here as well.
        if (!_.isString(sessionSecret)) {
          throw flaverr({ name: 'userError', code: 'E_INVALID_SESSION_SECRET' }, new Error('If provided, sails.config.session.secret should be a string.'));
        }
        return cookieParser(sessionSecret);
      }
      // If no session secret was provided in config
      // (e.g. if session hook is disabled and config/session.js is removed)
      // then we do not enable signed cookies by providing a cookie secret.
      // (note that of course signed cookies can still be enabled in a Sails app:
      // see conceptual docs on disabling the session hook for info)
      else {
        return cookieParser();
      }
    })(),

    compress: IS_NODE_ENV_PRODUCTION && require('compression')(),


    // Configures the middleware function used for parsing the HTTP request body, if enabled.
    bodyParser: (function() {

      var opts = {};
      var fn;

      opts.onBodyParserError = function (err, req, res, next) {// eslint-disable-line no-unused-vars
        // Note that we _need_ all four arguments in order for this function
        // to have special meaning as an error handler (i.e. to Express)

        var bodyParserFailureErrorMsg = 'Unable to parse HTTP body- error occurred :: ' + util.inspect((err&&err.stack)?err.stack:err, false, null);
        sails.log.error(bodyParserFailureErrorMsg);
        if (IS_NODE_ENV_PRODUCTION) {
          return res.status(400).send();
        }
        return res.status(400).send(bodyParserFailureErrorMsg);
      };

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


    // Add powered-by Sails header
    poweredBy: function xPoweredBy(req, res, next) {
      res.header('X-Powered-By', 'Sails <sailsjs.com>');
      next();
    }

  });
};
