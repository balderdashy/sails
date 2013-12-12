/**
 * Configure advanced options for the Express server inside of Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.express = {


	// Configures the middleware function used for parsing the HTTP request body
	// Defaults to the Formidable-based version built-in to Express/Connect
	//
	// To enable streaming file uploads (to disk or somewhere else)
	// you'll want to set this option to `false` to disable the body parser.
	//
	// Defaults to `express.bodyParser`
	//
	// Alternatively, if you're comfortable with the bleeding edge,
	// check out: https://github.com/mikermcneil/stream-debug
	//
	// Example override:
	// bodyParser: (function customBodyParser (req, res, next) {})(),



	// If bodyParser doesn't understand the HTTP body request data, 
	// run it again with an artificial header, forcing it to try and parse
	// the request body as JSON.
	// (this allows JSON to be used as your request data without the need to 
	// specify a 'Content-type: application/json' header)
	//
	// Defaults to `true`.
	//
	// NOTE: If using the `file-parser` above, you'll want to explicitly disable this:
	// retryBodyParserWithJSON: false,



	// Cookie parser middleware to use
	//			(or false to disable)
	//
	// Defaults to `express.cookieParser`
	//
	// Example override:
	// cookieParser: (function customMethodOverride (req, res, next) {})(),



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
};





/**
 * HTTP Flat-File Cache
 * 
 * These settings are for Express' static middleware- stuff like your
 * images, css, etc. 
 *
 * In Sails, this is probably your app's `assets directory.
 * By default, Sails uses your project's Gruntfile to compile/copy those 
 * assets to `.tmp/public`, where they're accessible to Express.
 *
 * The HTTP static cache is only active in a 'production' environment, 
 * since that's the only time Express will cache flat-files.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
module.exports.cache = {

	// The number of seconds to cache files being served from disk
	// (only works in production mode)
	maxAge: 31557600000
};
