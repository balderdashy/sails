/**
 * Module dependencies.
 */

var _			= require('lodash'),
	express		= require('express');


module.exports = function(sails) {

	
	var load = require('./load')(sails);
	var defaultBodyParser = require('./bodyParser')(sails);




	/**
	 * Expose `http` hook definition
	 */

	return {


		defaults: function (config) {
			return {

				// Self-awareness: the host the server *thinks it is*
				// host: 'localhost',

				// Port to run this app on
				port: 1337,

				// Users' SSL cert settings end up here
				ssl: {},

				// HTTP cache configuration
				cache: {
					maxAge: 31557600000
				},

				// Path where static files will be served from
				paths: {
					public: config.appPath + '/.tmp/public'
				},


				// Custom options for express server
				// (TODO: absorb customMidleware into core)
				express: {
					
					// Extra options to pass directly into the Express server
					// when it is instantiated
					// 			(or false to disable)
					//
					// This is the options object for the `createServer` method, as discussed here:
					// http://nodejs.org/docs/v0.10.20/api/https.html#https_class_https_server
					serverOptions: false,


					// Custom express middleware function to use
					customMiddleware: false,

					// Configures the middleware function used for parsing the HTTP request body
					// Defaults to the Formidable-based version built-in to Express/Connect
					//
					// To enable streaming file uploads (to disk or somewhere else)
					// you'll want to set this option to `false` to disable the body parser.
					//
					// Alternatively, if you're comfortable with the bleeding edge,
					// check out: https://github.com/mikermcneil/stream-debug
					bodyParser: defaultBodyParser,



					// Cookie parser middleware to use
					//			(or false to disable)
					//
					// Defaults to `express.cookieParser`
					//
					// Example override:
					// cookieParser: (function cookieParser (req, res, next) {})(),
					cookieParser: express.cookieParser,



					// HTTP method override middleware
					//			(or false to disable)
					//
					// This option allows artificial query params to be passed to trick 
					// Express into thinking a different HTTP verb was used.
					// Useful when supporting an API for user-agents which don't allow 
					// PUT or DELETE requests
					//
					// Defaults to `express.methodOverride`
					//
					// Example override:
					// methodOverride: (function customMethodOverride (req, res, next) {})()
					methodOverride: express.methodOverride

				}

			};
		},


		configure: function () {

			// If one piece of the ssl config is specified, ensure the other required piece is there
			if ( sails.config.ssl && (
					sails.config.ssl.cert && !sails.config.ssl.key
				) || (
					!sails.config.ssl.cert && sails.config.ssl.key
				)
			) {
				throw new Error('Invalid SSL config object!  Must include cert and key!');
			}

			if ( sails.config.host ) {
				sails.config.explicitHost = sails.config.host;
			}

		},


		/**
		 * Initialize is fired first thing when the hook is loaded
		 * but after waiting for user config (if applicable)
		 *
		 * @api public
		 */

		initialize: function(cb) {
			return load(cb);
		}
	};

};