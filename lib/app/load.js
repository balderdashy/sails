module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var async			= require('async'),

	util				= require('../util'),
	grunt				= require('../grunt')(sails),
	Configuration		= require('../configuration')(sails),
	MiddlewareRegistry	= require('../middleware')(sails),
	Express				= require('../express')(sails),
	Router				= require('../router')(sails),
	Hook				= require('../hooks')(sails),
	Modules				= require('../moduleloader');



	/**
	 * Expose loader start point.
	 * (idempotent)
	 *
	 * @api public
	 */

	return function load (configOverride, cb) {

		// configOverride is optional
		if (util.isFunction(configOverride)) {
			cb = configOverride;
			configOverride = {};
		}

		// Stow [CLI]/[env variables]/[override] (and clone it)
		configOverride = configOverride || {};
		// Environment variables should override other config
		configOverride.environment = process.env.NODE_ENV;
		configOverride.port = process.env.PORT;
		sails.config = util.clone(configOverride);

		async.auto({

			// Get configuration modules into memory
			config: [ Configuration.load ],

			// Fire up grunt task (only in development env)
			grunt: [ 'config', loadGrunt ],

			// Build and configure the Express server
			express: [ 'config', Express ],

			// Load hooks into memory, with their middleware and routes
			hooks: [ 'express', loadHooks ],

			// Populate the middleware registry
			middleware: [ 'hooks', MiddlewareRegistry.load ],

			// Load services
			services: [ 'middleware', loadServices ],

			// Build and configure the router using config + hooks
			router: [ 'express', 'middleware', Router.load ]

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
		util.each(sails.config.hooks, function (hookPrototype, id) {
			var def = hookPrototype(sails);
			sails.hooks[id] = new Hook(def);
		});

		// Load all hooks
		async.each(util.keys(sails.hooks), function (id, cb) {
			sails.log.verbose('Loading hook: ' + id);
			sails.hooks[id].load(function (err) {
				if (err) {
					sails.log.error('Hook failed to load: ' + id);
					sails.emit('hook:'+id+':error');
				}
				else {
					sails.log.verbose('Hook loaded successfully: ' + id);
					sails.emit('hook:'+id+':loaded');
				}
				cb(err);
			});
		}, function (err) {
			sails.log.verbose('Hooks loaded!');
			cb(err);
		});
	}




	/**
	 * Initialize this project's Grunt tasks
	 * and execute the environment-specific gruntfile
	 *
	 * @api private
	 */
	function loadGrunt (cb) {
		sails.log.verbose('Loading app Gruntfile...');

		// TODO:
		// Since there's likely a watch task involved, and we may need
		// to flush the whole thing, we need a way to grab hold of the child process
		// So we should save a reference to it as sails.grunt or something

		// Start task
		if(sails.config.environment === 'production'){
			grunt('prod', cb);
		} else {
			grunt('default', cb);
		}
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
				sails.log.error('Error encountered while loading Sails core!');
				sails.log.error(err);
				return cb(err);
			}

			// Wait until all hooks are ready
			sails.log.verbose('Waiting for all hooks to declare that they\'re ready...');
			var hookTimeout = setTimeout(function tooLong (){
				var hooksTookTooLongErr = 'Hooks are taking way too long to get ready...  ' +
					'Something is amiss.\nAre you using any custom hooks?';
				sails.log.error(hooksTookTooLongErr);
				throw new Error(hooksTookTooLongErr);
			}, 10000);

			async.whilst(
				function checkIfAllHooksAreReady () {
					return util.any(sails.hooks, function (hook) {
						return !hook.ready;
					});
				},
				function waitABit (cb) {
					setTimeout(cb, 150);
				},
				function hooksLoaded (err) {
					clearTimeout(hookTimeout);
					if (err) return cb('Error loading hooks.');

					sails.log('Sails loaded successfully.');
					cb();
				}
			);
		};
	}
};
