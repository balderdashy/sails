// express.js
// --------------------
//
// Configuration for the encapsulated Express server

var express = require('express');
var _ = require('lodash');
var Router = require('../router');
var fs = require('fs');

// Configure express server
exports.configure = function configure(cb) {

	// Define housing object for Express in the Sails namespace
	sails.express = {};

	// Configure express HTTP server
	if (sails.config.express.serverOptions) {
		sails.express.app = express.createServer(sails.config.express.serverOptions);
	} else sails.express.app = express.createServer();

	// Enable JSONP
	sails.express.app.enable("jsonp callback");

	sails.express.app.configure(function() {
		sails.express.app.set('views', sails.config.paths.views);
		sails.express.app.set('view engine', sails.config.viewEngine);
		sails.express.app.set('view options', {
			layout: sails.config.layout
		});
		
		// Route to error page
		sails.express.app.error(function(err, req, res, next) {
			var errors = _.isArray(errors) ? err : [err];

			// But augment response object first
			Router.enhance(req, res, 'error', 'error');

			require('../blueprints/error')(errors, req, res, next);
		});


		// Use body parser, if enabled
		if (sails.config.express.bodyParser) {
			sails.express.app.use(sails.config.express.bodyParser);
		}

		// TODO: Use 'accept-language' header to guess language settings
		var i18n = require('./i18n')(sails.locales);
		sails.express.app.use(i18n.init);

		// Development environment
		if (sails.config.environment === 'development') {

			// Set up error handling
			sails.express.app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));

			// TODO: watch for changes to models, controllers, policies, and services

			afterwards();
		}
		// Production environemnt
		else if (sails.config.environment === 'production') {

			// Ignore errors in production
			sails.express.app.use(express.errorHandler());
			afterwards();
		}

		function afterwards(err) {

			// Static middleware configuration
			var staticDirs = sails.config.paths['public'];
			var staticOptions = {};

			if (sails.config.environment === 'production') {

				// If a production public directory is configured, use it,
				// otherwise fall back to public
				staticDirs = sails.config.paths.productionPublic || staticDirs;

				// configure a cache maxAge
				staticOptions.maxAge = sails.config.cache.maxAge;
			}

			// If staticDirs is string, make it into an array
			if (_.isString(staticDirs)) staticDirs = [staticDirs];

			_.each(staticDirs, function(dirName) {
				sails.express.app.use(express['static'](dirName, staticOptions));
			});

			// Use the specified cookieParser
			if (sails.config.express.cookieParser) {
				sails.express.app.use(sails.config.express.cookieParser);
			}

			// Connect session to express
			sails.express.app.use(express.session(sails.config.session));
			
			// Add annoying Sails header instead of annoying Express header
			sails.express.app.use(function(req, res, next) {
				res.header('X-Powered-By', 'Sails <sailsjs.org>');
				next();
			});

			// Allow usage of custom express middleware
			if (sails.config.express.customMiddleware) {
				sails.config.express.customMiddleware(sails.express.app);
			}

			// Allow full REST simulation for clients which don't support it natively
			// (by using _method parameter)
			if (sails.config.express.methodOverride) {
				sails.express.app.use(sails.config.express.methodOverride);
			}

			// Set up express router
			sails.express.app.use(sails.express.app.router);

			cb(err);
		}
	});
};
