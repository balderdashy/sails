var express = require('express');
var _ = require('underscore');

// Configure express server
exports.configure = function configure() {

	// Define housing object for Express in the Sails namespace
	sails.express = {};

	// Configure express HTTP server
	sails.config.express.serverOptions ? 
		sails.express.app = express.createServer(sails.config.express.serverOptions)
	:	sails.express.app = express.createServer();

	sails.express.app.enable("jsonp callback");
	sails.express.app.configure(function() {
		sails.express.app.set('views', sails.config.paths.views);
		sails.express.app.set('view engine', sails.config.viewEngine);
		sails.express.app.set('view options', {
			layout: sails.config.layout
		});
        
        sails.express.app.use(require('./assets'));
		// Use body parser
		if(sails.config.express.bodyParser) {
			sails.express.app.use(sails.config.express.bodyParser);
		}


		// Use 'accept-language' header to guess language settings
		var i18n = require('./i18n.js')(sails.locales);
		sails.express.app.use(i18n.init);

		// Development environment
		if(sails.config.environment === 'development') {
			// Allow access to static dirs
			sails.express.app.use(express['static'](sails.config.paths['public']));


			// Set up error handling
			sails.express.app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));

		} 
		// Production environemnt
		else if(sails.config.environment === 'production') {
			var oneYear = sails.config.cache.maxAge;
			sails.express.app.use(express['static'](sails.config.path['public'], {
				maxAge: oneYear
			}));

			// ignore errors
			sails.express.app.use(express.errorHandler());
		}

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
