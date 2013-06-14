module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _				= require('lodash'),
	async				= require('async'),
	Configuration		= require('../configuration')(sails),
	MiddlewareRegistry	= require('../middleware')(sails),
	Express				= require('./configureExpress')(sails),
	Router				= require('../router')(sails),
	Hook				= require('../hooks')(sails),
	Modules				= require('../moduleloader'),
	Bootstrap			= require('./bootstrap')(sails);



	/**
	 * Expose loader start point.
	 * (idempotent)
	 *
	 * @api public
	 */

	return function load (cb) {

		async.auto({

			// Get configuration modules into memory
			config: [ Configuration.load ],

			// Get hooks into memory
			hooks: [ 'config', loadHooks ],

			// Populate the middleware registry
			middleware: [ 'hooks', MiddlewareRegistry.load ],

			// Build and configure the built-in Express server
			express: [ 'hooks', Express ],

			// Load services
			services: [ 'middleware', loadServices ],

			// Load policies chain applicable middleware
			policies: [ 'middleware', loadPolicies ],

			// Build and configure the router using config + hooks
			router: [ 'express', 'middleware', 'policies' , Router.load ],

			// Run the app bootstrap
			bootstrap: [ 'router' , Bootstrap ]


		}, ready(cb) );
	};



	/**
	 * Load hooks in parallel
	 * let them work out dependencies themselves,
	 * taking advantage of events fired from the sails object
	 *
	 * @api private
	 */

	function loadHooks (cb) {

		sails.hooks = {};

		// Instantiate all hooks
		_.each(sails.config.hooks, function (hookPrototype, id) {
			var def = hookPrototype(sails);
			sails.hooks[id] = new Hook(def);
		});

		// Load all hooks
		async.each(_.keys(sails.hooks), function (id, cb) {
			sails.log.verbose('Loading hook: '+id);
			sails.hooks[id].load(cb);
		}, cb);
	}



	/**
	 * Load policy middleware, then glue them onto mainline app middleware
	 * using the mapping in the policies config
	 *
	 * @api private
	 */

	function loadPolicies (cb) {

		sails.policies = {};

		// TODO

		cb();
	}



	/**
	 * Load generic js services
	 *
	 * @api private
	 */

	function loadServices (cb) {
		sails.log.verbose('Loading app services...');

		// Load app's service modules (case-insensitive)
		sails.services = Modules.optional({
			dirname		: sails.config.paths.services,
			filter		: /(.+)\.(js|coffee)$/,
			caseSensitive: true
		});
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