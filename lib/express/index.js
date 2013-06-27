module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
	async			= require('async'),
	express			= require('express'),
	startServer		= require('./start')(sails);



	/**
	 * Configure the encapsulated Express server
	 */

	return function loadExpress (cb) {

		// Define housing object for Express in the Sails namespace
		sails.express = {};

		// Create express server
		sails.express.app = express();


		// (required by Express 3.x)
		var usingSSL = ( ( sails.config.serverOptions && sails.config.serverOptions.key && sails.config.serverOptions.cert ) ||
					( sails.config.express && sails.config.express.serverOptions && sails.config.express.serverOptions.key && sails.config.express.serverOptions.cert ));
		
		// Get the appropriate server creation method for the protocol
		var createServer = usingSSL ? require('https').createServer : require('http').createServer;

		// Use serverOptions if they were specified
		// Manually create http server using Express app instance
		if (sails.config.express.serverOptions) {
			sails.express.server = createServer(sails.config.express.serverOptions, sails.express.app);
		}
		else sails.express.server = createServer(sails.express.app);


		// Install Express middleware
		var app = sails.express.app;
		app.configure(function(){

			// Set up location of server-side views and their engine
			sails.express.app.set('views', sails.config.paths.views);
			sails.express.app.set('view engine', sails.config.viewEngine);
			
			// Configure flat file server
			sails.express.app.use(express['static'](sails.config.paths['public'], {
				maxAge: sails.config.cache.maxAge
			}));
			app.use(express.favicon());

			// Use the specified cookieParser
			if (sails.config.express.cookieParser) {
				sails.log.verbose('Using secret: '+sails.config.session.secret+' in cookie parser');
				app.use(sails.config.express.cookieParser(sails.config.session.secret));
			}

			// Connect session to express
			app.use(express.session(sails.config.session));

			// Use body parser, if enabled
			if (sails.config.express.bodyParser) {
				app.use(sails.config.express.bodyParser());
			}

			// Use CSRF middleware if enabled
			if(sails.config.csrf){
				app.use(express.csrf());
				// pass csrf token to templates via locals
				app.use(function(req, res, next){
					res.locals._csrf = req.session._csrf;
					next();
				});
			}

			// Allow full REST simulation for clients which don't support it natively
			// (by using _method parameter)
			if (sails.config.express.methodOverride) {
				app.use(sails.config.express.methodOverride());
			}

			// Allow usage of custom express middleware
			// Must be before the router
			if (sails.config.express.customMiddleware) {
				sails.config.express.customMiddleware(app);
			}

			// Add annoying Sails header instead of annoying Express header
			app.use(function(req, res, next) {
				res.header('X-Powered-By', 'Sails <sailsjs.org>');
				next();
			});

			// Set up express router
			// Route last so all the middleware gets called
			app.use(app.router);
		});

		// When Sails binds routes, bind them to the internal Express router
		sails.on('router:bind', function (route) {

			route = _.clone(route);

			// TODO: Add support for error domains
			
			app[route.verb || 'all'](route.path, route.target);
		});

		// When Sails is finished routing, add a custom error handler
		sails.on('router:done', function () {

			// TODO: Handle this appropriately

			// Route to custom error page when errors occur
			// app.use(function(err, req, res, next) {
			// 	err = _.isArray(err) ? err : [err];

			// 	// But augment response object first
			// 	require('../router').enhance(req, res, 'error', 'error');

			// 	require('../blueprints/error')(err, req, res, next);
			// });
		});

		// When Sails is ready, start the express server
		sails.on('ready', startServer);

		return cb();


		// 	// Development environment
		// 	if (sails.config.environment === 'development') {

		// 		// Set up error handling
		// 		sails.express.app.use(express.errorHandler({
		// 			dumpExceptions: true,
		// 			showStack: true
		// 		}));

		// 		// TODO: watch for changes to models, controllers, policies, and services
		// 	}
		// 	// Production environemnt
		// 	else if (sails.config.environment === 'production') {

		// 		// Ignore errors in production
		// 		sails.express.app.use(express.errorHandler());
		// 	}

			// Static middleware configuration
			// var staticDirs = sails.config.paths['public'];
			// var staticOptions = {};

			// if (sails.config.environment === 'production') {

			// 	// If a production public directory is configured, use it,
			// 	// otherwise fall back to public
			// 	staticDirs = sails.config.paths.productionPublic || staticDirs;

			// 	// configure a cache maxAge
			// 	staticOptions.maxAge = sails.config.cache.maxAge;
			// }

		// 	// If staticDirs is string, make it into an array
		// 	if (_.isString(staticDirs)) staticDirs = [staticDirs];

		// 	_.each(staticDirs, function(dirName) {
		// 		sails.express.app.use(express['static'](dirName, staticOptions));
		// 	});

	};

};
