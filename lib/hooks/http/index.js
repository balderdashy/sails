/**
 * Module dependencies.
 */

var path = require('path');
var _ = require('@sailshq/lodash');
var mergeDefaults = require('merge-defaults');
var toStartServer = require('./start');



module.exports = function(sails) {


  var initialize = require('./initialize')(sails);



  /**
   * Expose `http` hook definition
   */

  return {


    defaults: function(config) {
      return {

        // Self-awareness: the host the server *thinks it is*
        // (this is necessary for some production environments-- only set it if you _absolutely_ need it)
        explicitHost: undefined,

        // Port to run this app on
        port: 1337,

        // SSL cert settings end up here
        ssl: {},

        // Path static files will be served from
        // Uses `path.resolve()` to accept either:
        //  • an absolute path
        //  • a relative path from the app root (sails.config.appPath)
        paths: {
          public: '.tmp/public'
        },


        // New http-only middleware config
        // (provides default middleware)
        http: {
          middleware: {
            order: [
              'cookieParser',
              'session',
              'bodyParser',
              'compress',
              'poweredBy',
              'router',
              'www',
              'favicon',
            ],

            // Built-in HTTP middleware functions are injected after the express
            // app instance has been created (i.e. `app`). See `./initialize.js`
            // and `./get-configured-http-middleware-fns.js` in this hook for details.

          },

          // HTTP cache configuration
          //
          // > Implicit default in production is 365.25 days (in dev: 1 milisecond).
          // FUTURE: remove implicit production default, and if this is production
          // and no cache was set, log a warning (in `configure`)
          cache: process.env.NODE_ENV !== 'production' ? 1 : 31557600000,

          // Extra options to pass directly into the Express server
          // when it is instantiated
          //      (or false to disable)
          //
          // This is the options object for the `createServer` method, as discussed here:
          // • http://nodejs.org/docs/v4.0.0/api/https.html#https_class_https_server
          // • http://nodejs.org/docs/v6.0.0/api/https.html#https_class_https_server
          // • http://nodejs.org/docs/v7.0.0/api/https.html#https_class_https_server
          serverOptions: undefined,


          // Custom express middleware function to use.
          // (FUTURE: add deprecation message if this is attempted-- instead recommend using an arbitrary middleware)
          customMiddleware: undefined,


        }//< .http>


      };//</ return {..} >
    },//< / defaults >



    configure: function() {

      // If one piece of the ssl config is specified, ensure the other required piece is there
      if (sails.config.ssl && (
        sails.config.ssl.cert && !sails.config.ssl.key
      ) || (!sails.config.ssl.cert && sails.config.ssl.key)) {
        throw new Error('Invalid SSL configuration in `sails.config.ssl`!  Must include `cert` and `key` properties!');
      }


      // Path static files will be served from
      //
      // Uses `path.resolve()` to accept either:
      //  • an absolute path
      //  • a relative path from the app root (sails.config.appPath)
      sails.config.paths.public = path.resolve(sails.config.appPath, sails.config.paths.public);


      // If no _explicit_ middleware order is specified, make sure the implicit default order
      // will be used. This allows overriding built-in middleware functions (like `www`)
      // without having to explicitly configure the `sails.config.http.middleware.order` array.
      sails.config.http.middleware.order = sails.config.http.middleware.order || sails.hooks.http.defaults(sails.config).http.middleware.order;
      // Note that this (^^) is probably not necessary anymore.


      //  ┌┐ ┌─┐┌─┐┬┌─┬ ┬┌─┐┬─┐┌┬┐┌─┐  ┌─┐┌─┐┌┬┐┌─┐┌─┐┌┬┐┬┌┐ ┬┬  ┬┌┬┐┬ ┬
      //  ├┴┐├─┤│  ├┴┐│││├─┤├┬┘ ││└─┐  │  │ ││││├─┘├─┤ │ │├┴┐││  │ │ └┬┘
      //  └─┘┴ ┴└─┘┴ ┴└┴┘┴ ┴┴└──┴┘└─┘  └─┘└─┘┴ ┴┴  ┴ ┴ ┴ ┴└─┘┴┴─┘┴ ┴  ┴
      //   ┬   ┌┬┐┌─┐┌─┐┬─┐┌─┐┌─┐┌─┐┌┬┐┬┌─┐┌┐┌  ┬ ┬┌─┐┬─┐┌┐┌┬┌┐┌┌─┐┌─┐
      //  ┌┼─   ││├┤ ├─┘├┬┘├┤ │  ├─┤ │ ││ ││││  │││├─┤├┬┘││││││││ ┬└─┐
      //  └┘   ─┴┘└─┘┴  ┴└─└─┘└─┘┴ ┴ ┴ ┴└─┘┘└┘  └┴┘┴ ┴┴└─┘└┘┴┘└┘└─┘└─┘
      // Backwards compatibility and/or deprecation messages for:
      //  • `sails.config.host`    => `sails.config.explicitHost`.
      //  • `sails.config.express` => `sails.config.http`.
      //  • `sails.config.express.loadMiddleware` => `sails.config.http`.
      //  • `sails.config.cache.maxAge` => `sails.config.http.cache`.
      if (sails.config.host) {
        // TODO: add deprecation warning (recommend using explicitHost instead)
        sails.config.explicitHost = sails.config.host;
      }

      // TODO replace this w/ error
      if (sails.config.express) {
        sails.log.debug('`sails.config.express` is deprecated; use `sails.config.http` instead.');
        // Merge in legacy `sails.config.express` object for backwards-compat.
        mergeDefaults(sails.config.http, sails.config.express);
      }

      // TODO replace this w/ error
      if (sails.config.http.loadMiddleware) {
        sails.log.debug('`sails.config.http.loadMiddleware` is deprecated; use `sails.config.http.middleware.order` instead.');
        // Note that currently this is still supported (see `./initialize.js`)
        // but it will likely be removed in an upcoming release of Sails.
      }

      // TODO replace this w/ error
      if (sails.config.cache && sails.config.cache.maxAge) {
        // (this used to be a default, but was incorrect and never doc'd)
        sails.log.debug('`sails.config.cache.maxAge is deprecated; use `sails.config.http.cache` instead.');
        if (sails.config.http.cache) {
          sails.log.debug('`Deprecated `sails.config.cache.maxAge` config is being used at the same time as the new `sails.config.http.cache` config. The modern configuration will take precedence.');
        }
        else {
          sails.config.http.cache = sails.config.cache.maxAge;
        }
      }

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // BACKWARDS COMPATIBILITY:
      // TODO: log warning if sails.config.http.bodyParser is set --
      //  -- instead, recommend using sails.config.http.middleware.bodyParser
      // Link to sailsjs.com/docs/concepts/middleware
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // BACKWARDS COMPATIBILITY:
      // TODO: log warning if sails.config.http.methodOverride is set --
      //  -- instead, recommend `npm install method-override --save` and using that
      //  instead within `sails.config.http.middleware.methodOverride` (i.e. explain
      //  that you can do `methodOverride: require('method-override')(),`-- and then
      //  that you'd need to add 'methodOverride' to the appropriate spot within the
      //  middleware order.
      //
      // Link to sailsjs.com/docs/concepts/middleware
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // HTTP method override middleware
      //
      // This option allows artificial query params to be passed to trick
      // Express into thinking a different HTTP verb was used.
      // Useful when supporting an API for user-agents which don't allow
      // PUT or DELETE requests
      //
      // Allow simulation of PUT and DELETE HTTP methods for user agents
      // which don't support it natively (looks for a `_method` param)
      //
      // Defaults to `method-override` module
      //
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



      // BACKWARDS COMPATIBILITY:
      // TODO: log warning if sails.config.http.cookieParser is set --
      //  -- instead, recommend specifying `sails.config.http.middleware.cookieParser`
      //  (i.e. explain that you can do `cookieParser: (function (){ return function (req,res,next) { return next(); })(),`.
      // Link to sailsjs.com/docs/concepts/middleware
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Cookie parser middleware to use
      //      (or false to disable)
      //
      // Defaults to `cookie-parser` module
      //
      // Example override:
      // cookieParser: (function cookieParser (req, res, next) {})(),
      // cookieParser: require('cookie-parser'),
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    },


    /**
     * Initialize is fired first thing when the hook is loaded
     * but after waiting for user config (if applicable).
     */
    initialize: require('./initialize')(sails),


    /**
     * `handleLift` is fired when sails is ready for HTTP requests to
     * start coming in.
     *
     * @param  {Function} done
     */
    handleLift: function(done){
      // In order for `sails.config` to be correct, this needs to happen in here.
      var startServer = toStartServer(sails);

      // Now that Sails is ready, start listening for requests on
      // the express server.
      startServer(done);
    }

  };
};
