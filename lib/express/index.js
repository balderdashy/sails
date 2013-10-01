module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util		= require( '../util' ),
	async			= require('async'),
	startServer		= require('./start')(sails),
	bodyParserRetry	= require('./bodyParserRetry')(sails),
	View = require('./view');


	/**
	 * Configure the encapsulated Express server
	 */

	return function loadExpress (cb) {

		// Required to be here due to dynmaic NODE_ENV settings via command line args
		var express = require('express'),
			expressUtils = require('../../node_modules/express/lib/utils.js');


		var bodyParserEnabled = util.isFunction(sails.config.express.bodyParser),
			bodyParserRetryEnabled = sails.config.express.retryBodyParserWithJSON,
			bodyParser = sails.config.express.bodyParser();

		// Define housing object for Express in the Sails namespace
		sails.express = {};
		sails.http = sails.express;

		// Create express server
		var app = sails.express.app = express();

		// (required by Express 3.x)
		var usingSSL = ( ( sails.config.serverOptions && sails.config.serverOptions.key && sails.config.serverOptions.cert ) ||
					( sails.config.express && sails.config.express.serverOptions && sails.config.express.serverOptions.key && sails.config.express.serverOptions.cert ));
		
		// Get the appropriate server creation method for the protocol
		var createServer = usingSSL ?
			require('https').createServer :
			require('http').createServer;

		// Use serverOptions if they were specified
		// Manually create http server using Express app instance
		if (sails.config.express.serverOptions) {
			sails.express.server = createServer(sails.config.express.serverOptions, sails.express.app);
		}
		else sails.express.server = createServer(sails.express.app);

		// Use View subclass to allow case-insensitive view lookups
		sails.express.app.set('view', View);

		// Set up location of server-side views and their engine
		sails.express.app.set('views', sails.config.paths.views);

		// Set view engine within express to set up res.render()
		app.engine(sails.config.views.engine.ext, sails.config.views.engine.fn);
		sails.express.app.set('view engine', sails.config.views.engine.ext);

		

		// Install Express middleware
		/////////////////////////////////////////////////////////////////


		// When Sails binds routes, bind them to the internal Express router
		sails.on('router:bind', function (route) {

			route = util.clone(route);

			// TODO: Add support for error domains

			app[route.verb || 'all'](route.path, route.target);
		});

		// When Sails unbinds routes, remove them from the internal Express router
		sails.on('router:unbind', function (route) {
			var newRoutes = [];
			util.each(app.routes[route.method], function(expressRoute) {
				if (expressRoute.path != route.path) {
					newRoutes.push(expressRoute);
				} 
			});
			app.routes[route.method] = newRoutes;

		});

		// When Sails is ready, start the express server
		sails.on('ready', startServer);
		

		// Use the specified cookieParser
		var cookieParser = sails.config.express.cookieParser;
		var sessionSecret = sails.config.session.secret;
		if (util.isFunction(cookieParser)) {
			app.use(cookieParser(sessionSecret));
			if (sails.config.environment === 'development') {
				sails.log.verbose('Using secret: '+sessionSecret+' in cookie parser');
			}
		}

		// If a Connect session store is configured, hook it up to Express
		if ( sails.config.session.store ) {
			app.use(express.session(sails.config.session));
		}

	  
		// Use body parser, if enabled
		if (bodyParserEnabled) {
			app.use(function(req, res, next) {
			  
				// Body parser can be disabled per-request for streaming file uploads
				if(req.bodyParserDisabled) {
					return next();
				}
				return bodyParser(req, res, next);
			});

			app.use(function handleBodyParserError(err, req, res, next) {
				
				// Add key middleware
				if (sails.config.hooks.request) {
					sails._mixinLocals(req,res);
					sails._mixinServerMetadata(req,res);
					sails._mixinReqQualifiers(req, res);
				}
				if (sails.config.hooks.views) {
					sails._mixinResView(req,res, function unused () {
						next('Unable to parse HTTP body :: ' + util.inspect(err));
					});
				}else{
					// Since an error occurred with the body parser,
					// we need to pick up the middleware necessary
					// to serve the error route which we would have 
					// gotten in the router and keep going
					next('Unable to parse HTTP body :: ' + util.inspect(err));
				}
			});

			// Retry body parser to try and force JSON, if enabled
			if (bodyParserRetryEnabled) {
				app.use(bodyParserRetry);
			}

		}

		var limitDefault = sails.config.fileUpload.maxMB;
		// TODO: add file upload / bodyParser config


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

		// Add powered-by Sails header
		app.use(function(req, res, next) {
			res.header('X-Powered-By', 'Sails <sailsjs.org>');
			next();
		});

		// Set up express router
		// Route almost last so all the middleware gets called first
		sails.log.verbose('Using Express router...');

		// Bind static routes and blueprints
		app.use(app.router);

		// Configure flat file server
		// Bind static files AFTER routing
		sails.log.verbose('Configuring express.static flat-file middleware...');
		var flatFileServer = express['static'](sails.config.paths['public'], {
			maxAge: sails.config.cache.maxAge
		});
		sails.express.app.use(flatFileServer);
		app.use(express.favicon());

		// Make some MIME type exceptions
		express['static'].mime.define({
			'application/font-woff': ['woff']
		});

		// Wait until everything else is done,
		// then bind configured 404 behavior
		app.use(function (req, res, next) {

			// Explicitly ignore error arg to avoid inadvertently
			// turning this into an error handler
			sails.config[404](req, res, next);
		});

		// When Sails is finished routing ALL routes (including implicit routes)
		// add our default error handler
		app.use(sails.config[500]);


		return cb();

	};

};
