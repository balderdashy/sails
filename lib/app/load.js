module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var async				= require('async'),
		util				= require('sails-util'),
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

		// Ensure override is an object and clone it (or make an empty object if it's not)
		configOverride = configOverride || {};
		sails.config = util.cloneDeep(configOverride);


		// If host is explicitly specified, set `explicitHost`
		// (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
		if (configOverride.host) {
			configOverride.explicitHost = configOverride.host;
		}
		

		async.auto({

			// Apply core defaults and hook-agnostic configuration,
			// esp. overrides including command-line options, environment variables,
			// and options that were passed in programmatically.
			config: [ Configuration.load ],

			// Load hooks into memory, with their middleware and routes
			hooks: [ 'config', loadHooks ],

			// Populate the middleware registry
			// (Basically, that means: grab `middleware` object from each hook
			//  and make it available as `sails.middleware.[HOOK_ID]`.)
			middleware: [ 'hooks', MiddlewareRegistry.load ],

			// Load the router and bind routes in `sails.config.routes`
			router: [ 'middleware', Router.load ]

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
			function (cb) {  initializeHooks(sails.hooks, cb); }
		], function (err) {
			if (err) return cb(err);

			// Inform any listeners that the initial, built-in hooks
			// are finished loading
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

		// If user configured `loadHooks`, only include those. 
		if ( sails.config.loadHooks ) {
			if ( ! util.isArray(sails.config.loadHooks) ) {
				return cb('Invalid `loadHooks` config.  '+
					'Please specify an array of string hook names.\n' +
					'You specified ::' + util.inspect(sails.config.loadHooks) );
			}

			util.each(hooks, function (def, hookName) {
				if ( !util.contains(sails.config.loadHooks, hookName) ){
					hooks[hookName] = false;
				}
			});
			sails.log.verbose('Deliberate partial load-- will only initialize hooks ::', sails.config.loadHooks);
		}

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
				// sails.log.error('Sails encountered the following error:');
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

					sails.log.verbose('All hooks were loaded successfully.');


					cb(null, sails);
				}
			);
		};
	}
};
