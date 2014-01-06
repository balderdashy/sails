/**
 * Module dependencies.
 */

var util		= require( 'sails-util'),
	async		= require('async');

module.exports = function (sails) {

	var startServer = require('./start')(sails);


	/**
	 * Configure the encapsulated Express server
	 */

	return function loadExpress (cb) {

		// Required to be here due to dynamic NODE_ENV settings via command line args
		var express = require('express'),
			expressUtils = require('express/lib/utils');


		// Create express server
		var app = sails.hooks.http.app = express();

		// (required by Express 3.x)
		var usingSSL = sails.config.ssl.key && sails.config.ssl.cert;

		// Merge SSL into server options
		var serverOptions = sails.config.express.serverOptions || {};
		util.extend(serverOptions, sails.config.ssl);
		
		// Get the appropriate server creation method for the protocol
		var createServer = usingSSL ?
			require('https').createServer :
			require('http').createServer;

		// Use serverOptions if they were specified
		// Manually create http server using Express app instance
		if (sails.config.express.serverOptions || usingSSL ) {
			sails.hooks.http.server = createServer(serverOptions, sails.hooks.http.app);
		}
		else sails.hooks.http.server = createServer(sails.hooks.http.app);


		// Configure views if hook enabled
		if ( sails.config.hooks.views ) {

			sails.after('hook:views:loaded', function () {
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

		

		// Install Express middleware
		/////////////////////////////////////////////////////////////////

		// TODO: share this middleware with socket.io


		// When Sails binds routes, bind them to the internal Express router
		sails.on('router:bind', function (route) {

			route = util.clone(route);

			// TODO: Add support for error domains..?

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


		// Track request start time as soon as possible
		// TODO: consider including connect.logger by default
		// (https://github.com/senchalabs/connect/blob/master/lib/middleware/logger.js)
		app.use(function (req, res, next){
			req._startTime = new Date();
			next();
		});
		

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
		var bodyParser = sails.config.express.bodyParser;
		if ( util.isFunction(bodyParser) ) {
			app.use(bodyParser());
			app.use(function handleBodyParserError(err, req, res, next) {
				sails.log.error('Unable to parse HTTP body- error occurred:');
				sails.log.error(err);
				return res.send(400, 'Unable to parse HTTP body- error occurred :: ' + util.inspect(err));
			});
		}


		// Allow simulation of PUT and DELETE HTTP methods for user agents
		// which don't support it natively (looks for a `_method` param)
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

		// Set up express router middleware last, so that all the
		// built-in core Express/Connect middleware gets called first,
		// before matching static routes and blueprints.
		sails.log.verbose('Using Express router...');
		app.use(app.router);

		// Configure flat file server to serve static files
		// (Note that routes/blueprints take precedence)
		sails.log.verbose('Configuring express.static flat-file middleware...');
		var flatFileServer = express['static'](sails.config.paths['public'], {
			maxAge: sails.config.cache.maxAge
		});
		sails.hooks.http.app.use(flatFileServer);
		app.use(express.favicon());

		// Make some MIME type exceptions for Google fonts
		express['static'].mime.define({
			'application/font-woff': ['woff']
		});

		// Wait until everything else is done,
		// then bind configured 404 behavior
		app.use(function (req, res, next) {

			// Explicitly ignore error arg to avoid inadvertently
			// turning this into an error handler
			sails.emit('router:request:404', req, res);
		});

		// When Sails is finished routing ALL routes (including implicit routes)
		// add our default error handler.
		app.use(function (err, req, res, next) {
			sails.emit('router:request:500', err, req, res);
		});

		return cb();
	};

};
