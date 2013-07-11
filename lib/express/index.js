module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util		= require( '../util' ),
	async			= require('async'),
	express			= require('express'),
	startServer		= require('./start')(sails),
	bodyParserRetry	= require('./bodyParserRetry')(sails);



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
		
		// Set up location of server-side views and their engine
		sails.express.app.set('views', sails.config.paths.views);
		sails.express.app.set('view engine', sails.config.views.engine);
		

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
			app.use(bodyParserRetry);
			app.use(function handleBodyParserError (err, req, res, next) {				
				
				// Add key middleware
				if (sails.config.hooks.request) {
					sails._mixinLocals(req,res);
					sails._mixinResError(req,res);
					sails._mixinServerMetadata(req,res);
					sails._mixinReqQualifiers(req, res);
				}
				if (sails.config.hooks.views) {
					sails._mixinResView(req,res, function unused () {
						next('Unable to parse HTTP body :: ' + util.inspect(err));
					});
				}

				// Since an error occurred with the body parser,
				// we need to pick up the middleware necessary
				// to serve the error route which we would have 
				// gotten in the router and keep going
				next('Unable to parse HTTP body :: ' + util.inspect(err));
			});
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

		// Add powered-by Sails header
		app.use(function(req, res, next) {
			res.header('X-Powered-By', 'Sails <sailsjs.org>');
			next();
		});

		// Set up express router
		// Route last so all the middleware gets called first
		app.use(app.router);



		// Bind static files after the static routes
		sails.on('router:beforeImplicit', function () {
			
			// Configure flat file server
			// AFTER dynamic routes have been bound
			sails.express.app.use(express['static'](sails.config.paths['public'], {
				maxAge: sails.config.cache.maxAge
			}));
			app.use(express.favicon());
		});
	

		// When Sails binds routes, bind them to the internal Express router
		sails.on('router:bind', function (route) {

			route = util.clone(route);

			// TODO: Add support for error domains

			app[route.verb || 'all'](route.path, route.target);
		});

		// When Sails unbinds routes, remove them from the internal Express router
		sails.on('router:unbind', function (path, method) {

			var newRoutes = [];
			util.each(app.routes[method], function(expressRoute) {
				if (expressRoute.path != path) {
					newRoutes.push(expressRoute);
				}
			});
			app.routes[method] = newRoutes;

		});		



		// When Sails is finished routing ALL routes (including implicit routes)
		// add our default error handler
		app.use(function (err, req, res, next) {

			// We need to force a reroute through to pick up
			// the other middleware

			
			sails.config[500](err, req, res, next);
		});


		// When Sails is ready, start the express server
		sails.on('ready', startServer);

		return cb();

	};

};
