/**
 * Module dependencies.
 */

var _ = require('lodash');

module.exports = function(sails) {

    /**
     * Configure the encapsulated Express server that will be used to serve actual HTTP requests
     */

    return function loadExpress(cb) {

        // In order for an existent and correct `sails.config`
        // to be passed in, these requires should be here,
        // not above:  ||
        //             \/
        var startServer = require('./start')(sails);

        // Provides support for undocumented `express.loadMiddleware` config
        // (should no longer be relevant in most cases thanks to new `http.middleware` conf)
        var installHTTPMiddleware = sails.config.http.loadMiddleware || require('./middleware/load');

        // Required to be here due to dynamic NODE_ENV settings via command line args
        // (i.e. if we `require` this above w/ everything else, the NODE_ENV might not be set properly yet)
        var express = require('express');


        // Create express server
        var app = sails.hooks.http.app = express();
        app.disable('x-powered-by');
        // (required by Express 3.x)
        var usingSSL = (sails.config.ssl.key && sails.config.ssl.cert) || sails.config.ssl.pfx;

        // Merge SSL into server options
        var serverOptions = sails.config.http.serverOptions || {};
        _.extend(serverOptions, sails.config.ssl);

        // Get the appropriate server creation method for the protocol
        var createServer = usingSSL ?
            require('https').createServer :
            require('http').createServer;

        // Use serverOptions if they were specified
        // Manually create http server using Express app instance
        if (sails.config.http.serverOptions || usingSSL) {
            sails.hooks.http.server = createServer(serverOptions, sails.hooks.http.app);
        } else sails.hooks.http.server = createServer(sails.hooks.http.app);


        // Configure views if hook enabled
        if (sails.hooks.views) {

            sails.after('hook:views:loaded', function() {
                var View = require('./view');

                // Use View subclass to allow case-insensitive view lookups
                sails.hooks.http.app.set('view', View);

                // Set up location of server-side views and their engine
                sails.hooks.http.app.set('views', sails.config.paths.views);

                // Teach Express how to render templates w/ our configured view extension
                app.engine(sails.config.views.engine.ext, sails.config.views.engine.fn);

                // Set default view engine
                sails.log.verbose('Setting default Express view engine to ' + sails.config.views.engine.ext + '...');
                sails.hooks.http.app.set('view engine', sails.config.views.engine.ext);
            });
        }

        // When Sails binds routes, bind them to the internal Express router
        sails.on('router:bind', function(route) {

            route = _.cloneDeep(route);

            app[route.verb || 'all'](route.path, route.target);
        });

        // When Sails unbinds routes, remove them from the internal Express router
        sails.on('router:unbind', function(route) {
          var newRoutes = [];
          _.each(app._router.stack, function(expressRoute) {
            if(!_.isObject(expressRoute.route)) return newRoutes.push(expressRoute);
            if (expressRoute.route.path !== route.path || !expressRoute.route.methods[route.verb]) {
                newRoutes.push(expressRoute);
            }
          });
          app._router.stack = newRoutes;
        });

        // 404 and 500 middleware should be attached at the very end
        sails.once('ready', function loadDefault404And500Errors(){
          app.use(function handleUnmatchedRequest(req, res, next) {
            // Explicitly ignore error arg to avoid inadvertently
            // turning this into an error handler
            sails.emit('router:request:404', req, res);
          });

          app.use(function handleError(err, req, res, next) {
            sails.emit('router:request:500', err, req, res);
          });
        });

        // When Sails is ready, start the express server
        sails.on('ready', startServer);

        // app.use() the configured express middleware
        var defaultMiddleware = require('./middleware/defaults')(sails, app);
        installHTTPMiddleware(app, defaultMiddleware, sails);
        // TODO: investigate sharing http middleware with sockets hook..?
        // (maybe not-- this is an open question with direct impact on sessions)
        // (this would be a v0.11.x thing)

        return cb();
    };

};
