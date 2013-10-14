module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var async			= require('async'),

	util				= require('../util'),
	grunt				= require('../grunt')(sails),
	Configuration		= require('../configuration')(sails),
	MiddlewareRegistry	= require('../middleware')(sails),
	// Express				= require('../express')(sails),
	Router				= require('../router')(sails),
	Hook				= require('../hooks')(sails);



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


		// Environment variables should override other config
		sails.config = util.cloneDeep(configOverride);

		async.auto({

			// Get configuration modules into memory
			config: [ Configuration.load ],

			// Fire up grunt task (only in development env)
			grunt: [ 'config', loadGrunt ],

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
		async.series([
			function (cb) { loadHookDefinitions(sails.hooks, cb); },
			function (cb) { initializeHooks(sails.hooks, cb); }
		], cb);
	}



	/**
	 * Load built-in hook definitions, as well as user hooks
	 *
	 * @api private
	 */

	function loadHookDefinitions (hooks, cb) {

		// Mix in user-configured hook definitions
		util.extend(hooks, sails.config.hooks);

		return cb();
	}



	/**
	 * Resolve the hook definitions and then finish loading them
	 *
	 * @api private
	 */

	function initializeHooks (hooks, cb) {
		// Instantiate Hook instances using definitions
		util.each(hooks, function (hookPrototype, id) {

			// Allow disabling of hooks by setting them to "false"
			// Mostly useful for testing, and may cause instability in production!
			if (hookPrototype === false || hooks[id.split('.')[0]] === false) {
				delete hooks[id];
				return;
			}

			// Handle folder-defined modules (default to index.js)
			// Since a hook definition must be a function
			if ( util.isDictionary(hookPrototype) ) {
				hookPrototype = hookPrototype.index;
			}

			if ( !util.isFunction(hookPrototype) ) {
				sails.log.error('Malformed hook! (' + id + ')');
				sails.log.error('Hooks should be a function with one argument (`sails`)');
				process.exit(1);
			}

			// Instantiate the hook
			var def = hookPrototype(sails);

			// Mix in an `identity` property to hook definition
			def.identity = id.toLowerCase();
			
			// New up an actual Hook instance
			hooks[id] = new Hook(def);
		});


		// Call `load` on each hook
		async.auto({

			initialize: function(cb) {
				async.each(util.keys(hooks), function initializeHook (id, cb) {
					sails.log.verbose('Loading hook: ' + id);
					hooks[id].load(function (err) {
						if (err) {
							sails.log.error('Hook failed to load: ' + id + ' ('+err+')');
							sails.emit('hook:'+id+':error');
							return cb(err);
						}
						
						sails.log.verbose('Hook loaded successfully: ' + id);
						sails.emit('hook:'+id+':loaded');

						// Defer to next tick to allow other stuff to happen
						process.nextTick(cb);
					});
				}, cb);
			}
		},

		function hooksReady (err) {
			sails.log.verbose('Hooks loaded!');
			sails.emit('hooks:loaded');
			return cb(err);
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

		// Start task depending on environment
		if(sails.config.environment === 'production'){
			return grunt('prod', cb);
		}

		grunt('default', cb);
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

					sails.log.verbose('Sails loaded successfully.');
					cb();
				}
			);
		};
	}
};
