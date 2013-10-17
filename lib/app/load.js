module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var async				= require('async'),
		util				= require('../util'),
		Configuration		= require('../configuration')(sails),
		MiddlewareRegistry	= require('../middleware')(sails),
		Router				= require('../router')(sails),
		initializeHooks		= require('./loadHooks')(sails);



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


		// TODO: load this as a proper hook instead of this hack
		if (configOverride.hooks && configOverride.hooks.moduleloader) {
			sails.modules = configOverride.hooks.moduleloader(sails);
			console.log('***\n',
				'Using custom loader:', sails.modules,
				'\n***');
		}
		else {
			// Provide access to module loader from the Sails object
			sails.modules = require('../hooks/moduleloader')(sails);
		}

		// If host is explicitly specified, set sails.explicitHost
		// (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
		if (configOverride.host) {
			sails.config.explicitHost = configOverride.host;
		}


		// Environment variables should override other config
		sails.config = util.cloneDeep(configOverride);

		async.auto({

			// Get configuration modules into memory
			config: [ Configuration.load ],

			// Load hooks into memory, with their middleware and routes
			hooks: [ 'config', loadHooks ],

			// Populate the middleware registry
			middleware: [ 'hooks', MiddlewareRegistry.load ],

			// Build and configure the router using config + hooks
			router: [ 'hooks', 'middleware', Router.load ]

		}, ready__(cb) );
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

		// If config.hooks is disabled, skip hook loading altogether
		if ( !sails.config.hooks ) {
			return cb();
		}


		async.series([
			function (cb) { loadHookDefinitions(sails.hooks, cb); },
			function (cb) { initializeHooks(sails.hooks, cb); }
		], function (err) {
			if (err) return cb(err);

			// Inform any listeners that the initial, built-in hooks
			// are finished loading (important for loading user hooks)
			sails.emit('hooks:builtIn:ready');
			sails.log.verbose('Built-in hooks are ready.');
			return cb();
		});
	}



	/**
	 * Load built-in hook definitions from `sails.config.hooks`
	 * and put them back into `hooks` (probably `sails.hooks`)
	 *
	 * @api private
	 */

	function loadHookDefinitions (hooks, cb) {

		// Mix in user-configured hook definitions
		util.extend(hooks, sails.config.hooks);

		return cb();
	}


	/**
	 * Returns function which is fired when Sails is ready to go
	 *
	 * @api private
	 */

	function ready__ (cb) {
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
					'Something is amiss.\nAre you using any custom hooks?\nIf so, make sure the hook\'s ' +
					'`initialize()` method is triggering it\'s callback.';
				sails.log.error(hooksTookTooLongErr);
				process.exit(1);
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

					sails.log.verbose('Sails loaded successfully.');
					cb();
				}
			);
		};
	}
};
