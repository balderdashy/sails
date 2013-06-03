// express.js
// --------------------
//
// Configuration for the encapsulated Express server

var express = require('express');
var _ = require('lodash');
// var Router = require('../router');
var fs = require('fs');

// Configure express server
module.exports = function configure(cb) {

	// Define housing object for Express in the Sails namespace
	sails.express = {};

	// Create express server
	sails.express.app = express();

	// Manually create http server using Express app instance
	// (required by Express 3.x)
	var usingSSL = ( ( sails.config.serverOptions && sails.config.serverOptions.key && sails.config.serverOptions.cert ) ||
				( sails.config.express && sails.config.express.serverOptions && sails.config.express.serverOptions.key && sails.config.express.serverOptions.cert ));
	
	// Get the appropriate server creation method for the protocol
	var createServer = usingSSL ? require('https').createServer : require('http').createServer;

	// Use serveroptions if they were specified
	if (sails.config.express.serverOptions) {
		sails.express.server = createServer(sails.config.express.serverOptions, sails.express.app);
	}
	else sails.express.server = createServer(sails.express.app);


	// Install Express middleware
	var app = sails.express.app;
	app.configure(function(){

		// Set up location of server-side views and their engine
		app.set('views', sails.config.paths.views);
		app.set('view engine', sails.config.viewEngine);
		
		// Configure flat file server
		sails.express.app.use(express['static'](sails.config.paths['public'], {
			maxAge: sails.config.cache.maxAge
		}));
		app.use(express.favicon());

			// Use the specified cookieParser
		if (sails.config.express.cookieParser) {
			app.use(sails.config.express.cookieParser);
		}

		// Connect session to express
		app.use(express.session(sails.config.session));

		// Use body parser, if enabled
		if (sails.config.express.bodyParser) {
			app.use(express.bodyParser());
		}

		// Allow full REST simulation for clients which don't support it natively
		// (by using _method parameter)
		if (sails.config.express.methodOverride) {
			app.use(express.methodOverride());
		}

		// Set up express router
		app.use(app.router);

		// Route to custom error page when errors occur
		app.use(function(err, req, res, next) {
			err = _.isArray(err) ? err : [err];

			// But augment response object first
			require('../router').enhance(req, res, 'error', 'error');

			require('../blueprints/error')(err, req, res, next);
		});

		// TODO: Use 'accept-language' header to guess language settings
		var i18n = require('../configuration/i18n')(sails.locales);
		sails.express.app.use(i18n.init);

		// Add annoying Sails header instead of annoying Express header
		app.use(function(req, res, next) {
			res.header('X-Powered-By', 'Sails <sailsjs.org>');
			next();
		});

		// Allow usage of custom express middleware
		if (sails.config.express.customMiddleware) {
			sails.config.express.customMiddleware(app);
		}
	});

	cb();


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