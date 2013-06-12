module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _				= require('lodash'),
	async				= require('async'),
	Configuration		= require('../configuration')(sails),
	MiddlewareRegistry	= require('./loadMiddleware')(sails),
	Express				= require('./configureExpress')(sails),
	Router				= require('./loadRouter')(sails);



	/**
	 * Expose loader start point.
	 * (idempotent)
	 *
	 * @api public
	 */

	return function load (cb) {

		async.auto({

			// Get configuration modules into memory
			config: [ (new Configuration()).load ],

			// Get hooks into memory
			hooks: [ 'config', Hooks ],

			// Instantiate the middleware registry
			middleware: [ 'hooks', MiddlewareRegistry ],

			// Build and configure the built-in Express server
			express: [ 'hooks', Express ],

			// Build and configure the router
			router: [ 'express', Router ]


		}, ready(cb) );
	};



	/**
	 * Load hooks in parallel
	 * let them work out dependencies themselves,
	 * taking advantage of events fired from the sails object
	 *
	 * @api private
	 */

	function Hooks (cb) {

		cb();
	}


	/**
	 * Returns function which is fired when Sails is ready to go
	 *
	 * @api private
	 */

	function ready (cb) {
		return function (err) {
			if (err) {
				sails.log.error('Error encountered while loading Sails!');
				sails.log.error(err);
				return cb(err);
			}
			sails.log.verbose('Sails loaded successfully.');
			cb();
		};
	}

/**
 * 
 */
// function loadHooks (cb) {

// 	// Build set of default hooks
// 	// ( NOTE: dependency list notation will eventually be pulled into the default hook modules themselves )
// 	var hooks = {

// 		configureExpress: [ require('./configureExpress') ],


// 		configureSocketIO: [ 'configureExpress', require('./configureSocketIO') ],


// 		grunt: [ require('./loadGrunt') ],


// 		middleware: [ require('./loadMiddleware') ],


// 		services: [ require('./loadServices') ],


// 		models: [ require('./loadModels') ],


// 		adapters: [ 'models', require('./loadAdapters') ],


// 		router: [ 'configureExpress', 'middleware', require('./loadRouter') ],


// 		orm: [ 'models', 'adapters', require('../orm').start ],


// 		globals: [ 'orm', require('./exposeGlobals') ],


// 		bootstrap: [ 'globals', require('./bootstrap') ]

// 	};

// 	// Mix in hooks from config
// 	_.extend(hooks, sails.config.hooks || {});
	
// 	async.auto(hooks, function (err) {
// 		if (err) {
// 			sails.log.error('Error encountered while loading Sails!');
// 			sails.log.error(err);
// 			return cb(err);
// 		}
// 		sails.log.verbose('Sails loaded successfully.');
// 		cb();
// 	});
// }

};