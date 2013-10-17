module.exports = function(sails) {

	////////////////////////////////////////////////////////////////////////////////
	//
	// NOTE:	Not in use yet!!!!
	//
	//			Subsequent 0.9.x release will bundle Express in the http hook.
	//			For now, Express is still tightly linked to the core.
	//
	////////////////////////////////////////////////////////////////////////////////


	/**
	 * Module dependencies.
	 */

	var _			= require('lodash'),
		load		= require('./load')(sails),
		express		= require('express');




	/**
	 * Expose `http` hook definition
	 */

	return {


		defaults: function (config) {
			return {

				// Self-awareness: the host the server *thinks it is*
				host: 'localhost',

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
					bodyParser: express.bodyParser,



					// If bodyParser doesn't understand the HTTP body request data, 
					// run it again with an artificial header, forcing it to try and parse
					// the request body as JSON.
					// (this allows JSON to be used as your request data without the need to 
					// specify a 'Content-type: application/json' header)
					//
					// NOTE: If using the `file-parser` above, you'll want to explicitly disable this config.
					retryBodyParserWithJSON: true,



					// Cookie parser middleware to use
					//			(or false to disable)
					//
					// Defaults to `express.cookieParser`
					//
					// Example override:
					// cookieParser: (function customMethodOverride (req, res, next) {})(),
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