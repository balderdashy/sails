// express.js
// --------------------
//
// Configuration for the encapsulated Express server

var express = require('express');
var _ = require('underscore');
var assets = require('./assets');

// Configure express server
exports.configure = function configure() {

	// Define housing object for Express in the Sails namespace
	sails.express = {};

	// Configure express HTTP server
	sails.config.express.serverOptions ? sails.express.app = express.createServer(sails.config.express.serverOptions) : sails.express.app = express.createServer();

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
			require('./scaffolds/error')(errors, req, res, next);
		});


		// Use body parser, if enabled
		if(sails.config.express.bodyParser) {
			sails.express.app.use(sails.config.express.bodyParser);
		}

		// TODO: Use 'accept-language' header to guess language settings
		var i18n = require('./i18n.js')(sails.locales);
		sails.express.app.use(i18n.init);

		// Development environment
		if(sails.config.environment === 'development') {

			////////////////////////////////////////////////////////////
			// TODO: put asset rack back in when the code is fast enough
			////////////////////////////////////////////////////////////

			// Handle AND instantiate assets after each request
			// sails.express.app.use(function(req, res, next) {

			// 	// require('./assets')().handle(req, res, next);

			// 	next();
			// });

			// Provide access to asset compilation functions in views/layout
			sails.express.app.use(function (req,res,next) {

				// Compile LESS files
				sails.log.verbose("Development mode: Recompiling SASS, LESS, and CoffeeScript...");
				assets.development.compile(sails.config.assets.sequence, {
					environment: sails.config.environment,
					outputPath: sails.config.assets.outputPath
				}, function (err) {
					if (err) return res.send(err,500);
					
					// Render links to assets into view
					res.locals({
						assets: assets.development
					});
					next();
				});
			});

			// Allow access to static dirs
			sails.express.app.use(express['static'](sails.config.paths['public']));

			// Allow access to compiled and uncompiled rigging directories
			sails.express.app.use('/rigging_static', express['static'](sails.config.assets.outputPath));
			_.each(sails.config.assets.sequence, function(item) {
				sails.express.app.use('/rigging_static', express['static'](item));
			});

			


			// Set up error handling
			sails.express.app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));

		}
		// Production environemnt
		else if(sails.config.environment === 'production') {

			////////////////////////////////////////////////////////////
			// TODO: put asset rack back in the code is fast enough
			////////////////////////////////////////////////////////////

			// In production mode, instantiate assets only once at server start time
			// var instantiatedAssets = require('./assets')();

			// // And then handle them on each subsequent request
			// sails.express.app.use(function(req, res, next) {
			// 	instantiatedAssets.handle(req, res, next);
			// });

			// Temporary solution
			sails.express.app.use(require('./assets').development);

			// Configure access to public dir w/ a cache maxAge
			sails.express.app.use(express['static'](sails.config.paths['public'], {
				maxAge: sails.config.cache.maxAge
			}));

			// Ignore errors in production
			sails.express.app.use(express.errorHandler());
		}

		// Use the specified cookieParser
		if(sails.config.express.cookieParser) {
			sails.express.app.use(sails.config.express.cookieParser);
		}

		// Connect session to express
		sails.express.app.use(express.session(sails.config.session));

		// Add annoying Sails header instead of annoying Express header
		sails.express.app.use(function(req, res, next) {
			res.header("X-Powered-By", 'Sails <sailsjs.org>)');
			next();
		});

		// Allow usage of custom express middleware
		if(sails.config.express.customMiddleware) {
			sails.config.express.customMiddleware(sails.express.app);
		}

		// Allow full REST simulation for clients which don't support it natively
		// (by using _method parameter)
		if(sails.config.express.methodOverride) {
			sails.express.app.use(sails.config.express.methodOverride);
		}

		// Set up express router
		sails.express.app.use(sails.express.app.router);
	});

	// By convention, serve .json files using the same view engine
	sails.express.app.register('.json', sails.config.viewEngine);
};