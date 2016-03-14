/**
 * Module dependencies.
 */

var _ = require('lodash');
var getConfiguredHttpMiddlewareFns = require('./get-configured-http-middleware-fns');



module.exports = function(sails) {

  /**
   * initialize()
   *
   * Configure the encapsulated Express server that will be used to serve actual HTTP requests
   */

  return function initialize(cb) {

    // Before proceeding, wait for the session hook--
    // or if it is disabled, then go ahead and proceed
    // (but change the middleware order config so we don't
    //  attempt to handle sessions).
    (function _waitForSessionHookIfApplicable(next){
      // If the session hook is available...
      if (sails.hooks.session) {
        // Then wait until after session hook has initialized
        // so that the proper session config is available for use
        // in the built-in "session" middleware.
        sails.after('hook:session:loaded', function () {
          return next();
        });
      }
      // Otherwise, the session hook is NOT available.
      else {
        // Then, if it present, rip out "session" from the configured
        // middleware order so we don't try to use the built-in session
        // middleware.
        _.pull(sails.config.http.middleware.order, 'session');
        return next();
      }
    })(function _afterLoadingSessionHookIfApplicable(err) {
      if (err) { return cb(err); }

      // Required to be here due to dynamic NODE_ENV settings via command line args
      // (i.e. if we `require` this above w/ everything else, the NODE_ENV might not be set properly yet)
      var express = require('express');

      // Create express app instance.
      var expressApp = express();

      // Expose express app as `sails.hooks.http.app` for use in other files
      // in this hook, and in other core hooks.
      sails.hooks.http.app = expressApp;

      // Disable the default powered-by header (required by Express 3.x).
      expressApp.disable('x-powered-by');

      // Determine whether or not to create an HTTPS server
      var isUsingSSL =
        (sails.config.ssl === true) ||
        (sails.config.ssl.key && sails.config.ssl.cert) ||
        sails.config.ssl.pfx;

      // Merge SSL into server options
      var serverOptions = sails.config.http.serverOptions || {};
      _.extend(serverOptions, sails.config.ssl);

      // Lodash 3's _.merge attempts to transform buffers into arrays;
      // so if we detect an array, then transform it back into a buffer.
      _.each(['key', 'cert', 'pfx'], function _eachSSLOption(sslOption) {
        if (_.isArray(serverOptions[sslOption])) {
          serverOptions[sslOption] = new Buffer(serverOptions[sslOption]);
        }
      });
      // ^^^ The following is probably not relevant anymore, because `_.merge()`
      // is not being used above.  Leaving for compatibility reasons (just to be safe).

      // Get the appropriate server creation method for the protocol
      var createServer = isUsingSSL ?
        require('https').createServer :
        require('http').createServer;

      // Use serverOptions if they were specified
      // Manually create http server using Express app instance
      if (sails.config.http.serverOptions || isUsingSSL) {
        sails.hooks.http.server = createServer(serverOptions, expressApp);
      }
      else {
        sails.hooks.http.server = createServer(expressApp);
      }

      // Keep track of all openTcpConnections that come in,
      // so we can destroy them later if we want to.
      var openTcpConnections = {};

      // Listen for `connection` events on the raw HTTP server.
      sails.hooks.http.server.on('connection', function _onNewTCPConnection(tcpConnection) {
        var key = tcpConnection.remoteAddress + ':' + tcpConnection.remotePort;
        openTcpConnections[key] = tcpConnection;
        tcpConnection.on('close', function() {
          delete openTcpConnections[key];
        });
      });

      // Create a `destroy` method we can use to do a hard shutdown of the server.
      sails.hooks.http.destroy = function(done) {
        sails.log.verbose('Destroying http server...');
        sails.hooks.http.server.close(done);
        // TODO: consider moving this loop ABOVE sails.hooks.http.server.close(done) for clarity (since at this point we've passed control via `done`)
        for (var key in openTcpConnections) {
          openTcpConnections[key].destroy();
        }
      };

      // Configure views if hook enabled
      if (sails.hooks.views) {

        // TODO: explore handling this differently to avoid potential
        // timing issues with view engine configuration
        sails.after('hook:views:loaded', function() {
          var View = require('./view');

          // Use View subclass to allow case-insensitive view lookups
          expressApp.set('view', View);

          // Set up location of server-side views and their engine
          expressApp.set('views', sails.config.paths.views);

          // Teach Express how to render templates w/ our configured view extension
          expressApp.engine(sails.config.views.engine.ext, sails.config.views.engine.fn);

          // Set default view engine
          sails.log.verbose('Setting default Express view engine to ' + sails.config.views.engine.ext + '...');
          expressApp.set('view engine', sails.config.views.engine.ext);
        });
      }

      // Whenever Sails binds a route, bind it to the internal Express router.
      sails.on('router:bind', function(route) {

        route = _.cloneDeep(route);

        expressApp[route.verb || 'all'](route.path, route.target);
      });

      // Whenever Sails unbinds a route, remove it from the internal Express router.
      sails.on('router:unbind', function(route) {
        var newRoutes = [];
        _.each(expressApp.routes[route.method], function(expressRoute) {
          if (expressRoute.path !== route.path) {
            newRoutes.push(expressRoute);
          }
        });
        expressApp.routes[route.method] = newRoutes;
      });

      // Now expressApp.use() an initial piece of middleware to bind
      // _core, mandatory properties_ to the incoming `req`.
      // This middleware cannot be disabled in userland configuration--
      // and that's done on purpose.
      expressApp.use(function _exposeSailsOnReq (req, res, next){
         // Expose req._sails on incoming HTTP request instances.
         //
         // This is also handled separately for virtual requests in `lib/router/`:
         // (see https://github.com/balderdashy/sails/pull/3599#issuecomment-195665040)
        req._sails = sails;

        return next();
      });


      // Then build a dictionary of configured middleware functions, including
      // built-in middleware as well as any middleware provided in
      // `sails.config.http.middleware`.
      var configuredHttpMiddlewareFns = getConfiguredHttpMiddlewareFns(expressApp.router, sails);


      // If a custom `loadMiddleware` function was configured, then call it to "use"
      // the configured middleware (instead of doing it automatically with the more
      // modern `sails.config.http.middleware.order` configuration).
      //
      // This is primarily for backwards compatibility for the undocumented
      // `express.loadMiddleware` config that is still in use in legacy apps
      // from the 2013-early 2014 time frame.
      //
      // It is no longer relevant in most cases thanks to `sails.config.http.middleware`,
      // and may be removed in an upcoming release.
      if (sails.config.http.loadMiddleware) {
        sails.config.http.loadMiddleware(expressApp, configuredHttpMiddlewareFns, sails);
      }
      // Otherwise (i.e. the normal case) we `.use()` each of the configured
      // middleware functions in the configured order (`sails.config.http.midleware.order`).
      else {
        _.each(sails.config.http.middleware.order, function (middlewareKey) {

          // `$custom` is a special entry in the middleware order config that exists
          // purely for compatibility.  When procesing `$custom`, we check to see if
          // `sails.config.http.customMiddleware`, was provided and if so, call it
          // with the express app instance as an argument (rather than calling
          // `sails.config.http.middleware.$custom`).
          // If `customMiddleware` is not being used, we just ignore `$custom` altogether.
          if (middlewareKey === '$custom') {
            if (sails.config.http.customMiddleware) {
              // Allows for injecting a custom function to attach middleware.
              // (This is here for compatibility, and for situations where the raw Express
              //  app instance is necessary for configuring middleware).
              sails.config.http.customMiddleware(expressApp);
            }
            // Either way, bail at this point (we don't want to do anything further with $custom)
            return;
          }

          // Look up the referenced middleware function.
          var referencedMwr = configuredHttpMiddlewareFns[middlewareKey];

          // If a middleware fn by this name is not configured (i.e. `undefined`),
          // then skip this entry & write a verbose log message.
          if (_.isUndefined(referencedMwr)) {
            sails.log.verbose('An entry (`%s`) in `sails.config.http.middleware.order` references an unrecognized middleware function-- that is, it was not provided as a key in the `sails.config.http.middleware` dictionary. Skipping...', middlewareKey);
            return;
          }
          // On the other hand, if the referenced middleware appears to be disabled
          // _on purpose_, or because _it is not compatible_, then just skip it and
          // don't log anything. (i.e. it is `null` or `false`)
          if (!referencedMwr) {
            return;
          }

          // Otherwise, we're good to go, so go ahead and use the referenced
          // middleware function.
          expressApp.use(referencedMwr);

        });//</each item in `sails.config.http.middleware.order`>
      }

      // All done!
      return cb();

    });//</_afterLoadingSessionHookIfApplicable>
  };//</initialize()>
};
