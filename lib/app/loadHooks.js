module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var async			= require('async'),
		util			= require('../util'),
		Hook			= require('../hooks')(sails);

	/**
	 * Resolve the hook definitions and then finish loading them
	 *
	 * @api private
	 */

	return function initializeHooks (hooks, cb) {

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
			return cb(err);
		});
	};

};
