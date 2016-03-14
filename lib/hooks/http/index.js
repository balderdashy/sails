/**
 * Module dependencies.
 */

var path = require('path');
var _ = require('lodash');
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
        // host: 'localhost',

        // Port to run this app on
        port: 1337,

        // Users' SSL cert settings end up here
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
              'startRequestTimer',
              'cookieParser',
              'session',
              'bodyParser',
              'handleBodyParserError',
              'compress',
              'methodOverride',
              'poweredBy',
              '$custom',
              'router',
              'www',
              'favicon',
              '404',
              '500'
            ],

            // Built-in HTTP middleware functions are injected after the express
            // app instance has been created (i.e. `app`). See `./initialize.js`
            // and `./get-configured-http-middleware-fns.js` in this hook for details.

          },

          // HTTP cache configuration
          cache: config.environment === 'development' ? 1 : 31557600000,

          // Extra options to pass directly into the Express server
          // when it is instantiated
          //      (or false to disable)
          //
          // This is the options object for the `createServer` method, as discussed here:
          // http://nodejs.org/docs/v0.10.20/api/https.html#https_class_https_server
          serverOptions: undefined,


          // Custom express middleware function to use
          customMiddleware: undefined,

          // Configures the middleware function used for parsing the HTTP request body
          // Defaults to the Formidable-based version built into Express/Connect
          //
          // To enable streaming file uploads (to disk or somewhere else)
          // you'll want to set this option to `false` to disable the body parser.
          //
          // Alternatively, if you're comfortable with the bleeding edge,
          // check out: https://github.com/balderdashy/skipper
          bodyParser: undefined,



          // Cookie parser middleware to use
          //      (or false to disable)
          //
          // Defaults to `cookie-parser` module
          //
          // Example override:
          // cookieParser: (function cookieParser (req, res, next) {})(),
          cookieParser: require('cookie-parser'),



          // HTTP method override middleware
          //      (or false to disable)
          //
          // This option allows artificial query params to be passed to trick
          // Express into thinking a different HTTP verb was used.
          // Useful when supporting an API for user-agents which don't allow
          // PUT or DELETE requests
          //
          // Defaults to `method-override` module
          //
          // Example override:
          // methodOverride: (function customMethodOverride (req, res, next) {})()
          methodOverride: require('method-override')


        }


      };
    },



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
        sails.config.explicitHost = sails.config.host;
      }

      if (sails.config.express) {
        sails.log.debug('`sails.config.express` is deprecated; use `sails.config.http` instead.');
        // Merge in legacy `sails.config.express` object for backwards-compat.
        mergeDefaults(sails.config.http, sails.config.express);
      }

      if (sails.config.http.loadMiddleware) {
        sails.log.debug('`sails.config.http.loadMiddleware` is deprecated; use `sails.config.http.middleware.order` instead.');
        // Note that currently this is still supported (see `./initialize.js`)
        // but it will likely be removed in an upcoming release of Sails.
      }

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
