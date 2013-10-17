module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var express = require('express');


	/** 
	 * Set up default global configuration for Sails
	 *
	 * Only reason to pass in appPath is to set up reasonable defaults for paths
	 */

	return function defaultConfig (appPath) {
		
		// If `appPath` not specified, unfortunately, this is a fatal error,
		// since reasonable defaults cannot be assumeduse
		if ( !appPath) {
			throw new Error('No appPath specified for `lib/configuration/defaults`');
		}

		// Set up config defaults
		return {

			// Save appPath in implicit defaults
			appPath: appPath,

			// Port to run this app on
			// TODO: move into sockets and http hooks
			port: 1337,

			// Self-awareness: the host the server *thinks it is*
			// TODO: move into sockets and http hooks
			host: 'localhost',

			// Environment to run this app in; one of: ["development", "production"]
			environment: 'development',

			// Variables which will be made globally accessible
			globals: {
				_: true,
				async: true,
				sails: true,
				services: true,
				adapters: true,
				models: true
			},

			// Paths for application modules and key files
			// If `paths.app` not specified, use process.cwd()
			// (the directory where this Sails process is being initiated from)
			paths: {
				dependencies: appPath + '/dependencies',
				tmp: appPath + '/.tmp',
			},

			// Default hooks
			hooks: {
				moduleloader: require('../hooks/moduleloader'),
				request		: require('../hooks/request'),
				orm			: require('../hooks/orm'),
				views		: require('../hooks/views'),
				controllers	: require('../hooks/controllers'),
				sockets		: require('../hooks/sockets'),
				pubsub		: require('../hooks/pubsub'),
				policies	: require('../hooks/policies'),
				services	: require('../hooks/services'),
				csrf		: require('../hooks/csrf'),
				cors		: require('../hooks/cors'),
				i18n		: require('../hooks/i18n'),
				userconfig	: require('../hooks/userconfig'),
				session		: require('../hooks/session'),
				grunt		: require('../hooks/grunt'),
				http		: require('../hooks/http'),
				userhooks	: require('../hooks/userhooks')
			},

			// Default 404 (not found) handler
			// TODO: move into request hook
			404: function notFound (req, res) {
				res.send(404);
			},

			// Default 500 (server error) handler
			// TODO: move into request hook
			500: function (errors, req, res) {
				res.send(errors || undefined, 500);
			},

			// Default 403 (forbidden) handler
			// TODO: move into request hook
			403: function (message, req, res) {
				res.send(message || undefined, 403);
			},

			// Default 400 (bad request) handler
			// TODO: move into request hook
			400: function (errors, redirectTo, req, res) {
				res.send(errors || undefined, 400);
			},


			// Controller config
			// TODO: move into controllers hook
			controllers: {

				// (Note: global controller.blueprints config may be overridden on a per-controller basis
				//			by setting the 'blueprint' property in a controller)
				blueprints: {

					// Whether routes are automatically generated for controller actions
					actions: true,

					// e.g. '/:controller/find/:id'
					shortcuts: true,

					// e.g. 'get /:controller/:id?': 'foo.find'
					rest: true,

					// Optional mount path prefix for blueprint routes
					// e.g. '/api/v2'
					prefix: '',

					// If a blueprint REST route catches a request,
					// only match an `id` if it's an integer
					expectIntegerId: false, 

					// Enable JSONP callbacks on REST blueprints
					jsonp: false,

					// Pluralize controller names in routes
					pluralize: false
				}
			},


			// i18n
			// TODO: move into i18n hook
			i18n: {
				locales: ['en', 'es'],
				defaultLocale: 'en',
				localesDirectory: '/config/locales'
			},


			// CSRF middleware protection, all non-GET requests must send '_csrf' parmeter
			// _csrf is a parameter for views, and is also available via GET at /csrfToken
			// TODO: move into csrf hook
			csrf: false,

			cors: {
				origin: '*',
				credentials: true,
				methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
				headers: 'content-type'
			},

			// File upload settings
			// TODO: deprecate along the road to  0.11 and the new file-parser
			fileUpload: {
				maxMB: 10
			},

			// HTTP cache configuration
			// TODO: move into http hook
			cache: {
				maxAge: 31557600000
			},

			// Session store configuration
			// TODO: move into socketsk and http hooks
			session: {
	            adapter: 'memory',
				key: "sails.sid"
			},

			// Logging config
			log: {
				level: 'info'
			},

			// Name of application for layout title
			// TODO: deprecate this-- its superfluous
			appName: 'Sails',

			// Default policy mappings (allow all)
			// TODO: move into policies hook
			policies: { '*': true },

			// Default routes (none)
			routes: {},

			// Custom options for express server
			// TODO: move into http hook
			// (and absorb customMidleware into core)
			express: {
				
				// Options to pass directly into the Express server
				// when it is instantiated
				// 			(or false to disable)
				serverOptions: false,

				// Custom express middleware function to use
				customMiddleware: false,

				// Configures the middleware function used for parsing the HTTP request body
				// Defaults to the Formidable-based version built-in to Express/Connect
				//
				// To enable streaming file uploads (to disk or somewhere else)
				// you'll want to set this to `false` to disable it.
				// Alternatively, if you're comfortable with the bleeding edge,
				// check out: https://github.com/mikermcneil/stream-debug
				bodyParser: express.bodyParser,

				// If bodyParser doesn't understand the HTTP body request data, 
				// run it again with an artificial header, forcing it to try and parse
				// the request body as JSON
				// (this allows JSON to be used as your request data without the need to 
				// specify a 'Content-type: application/json' header)
				retryBodyParserWithJSON: true,

				// Cookie parser middleware to use
				//			(or false to disable)
				//
				cookieParser: express.cookieParser,

				// HTTP method override middleware
				//			(or false to disable)
				//
				// This option allows artificial query params to be passed to trick 
				// Express into thinking a different HTTP verb was used.
				// Useful when supporting an API for user-agents which don't allow 
				// PUT or DELETE requests
				methodOverride: express.methodOverride
			},

			

			// SSL cert settings go here
			// TODO: move into sockets and http hooks
			ssl: {}

		};
	};

};
