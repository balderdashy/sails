// express.js
// --------------------
//
// Configuration for the encapsulated Express server

var express = require('express');
var _ = require('underscore');
var router = require('./router');
var fs = require('fs');

// Configure express server
exports.configure = function configure(cb) {

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

			// But augment response object first
			router.enhance(req,res,'error','error');

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
		// Handle AND instantiate assets after each request
		if(sails.config.environment === 'development') {

			// Set up error handling
			sails.express.app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));

			// Provide access to asset compilation functions in views/layout
            var assets = require('./assets').createAssets();
            _.each(sails.config.assets.sequence, function(dirname) {    
                fs.watch(dirname, function() {
                    assets = require('./assets').createAssets();
                });     
            });
            sails.express.app.use(function(req, res, next) {
                assets.handle(req, res, next);
            });
            afterwards();
		}
		// Production environemnt
		else if(sails.config.environment === 'production') {

			// Ignore errors in production
			sails.express.app.use(express.errorHandler());

			// Provide access to asset compilation functions in views/layout
            var assets = require('./assets').createAssets();
            sails.express.app.use(assets);
            afterwards();
		}

		function afterwards(err) {

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

			cb(err);
		}
	});
};
