module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var async			= require('async'),
		util			= require('sails-util'),
		Hook			= require('../hooks')(sails);

	/**
	 * Module errors
	 */
	var Err = {
		dependency: function (dependent, dependency) {
			return new Error( '\n' + 
				'Cannot use `' + dependent + '` hook ' + 
				'without the `' + dependency + '` hook enabled!'
			);
		}
	};		

	/**
	 * Resolve the hook definitions and then finish loading them
	 *
	 * @api private
	 */

	return function initializeHooks (hooks, cb) {

		var loadGraph = {};

		// Instantiate Hook instances using definitions
		util.each(hooks, function (hookPrototype, id) {

			// Allow disabling of hooks by setting them to "false"
			// Useful for testing, but may cause instability in production!
			// I sure hope you know what you're doing :)
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
			var def = hookPrototype(sails),
					loadAfter,
					loadBefore;

			// Mix in an `identity` property to hook definition
			def.identity = id.toLowerCase();

			// Build an acyclic hook dependency graph
			loadGraph[id] = loadGraph[id] || [];
			loadGraph[id].push(async.apply(initializeHook, id));

			// Build graph for hooks that should be loaded before this one
			if (loadAfter = def.loadAfter) {
				loadAfter = loadAfter instanceof Array ? loadAfter : [loadAfter];
				loadAfter.forEach(function (hookToWaitFor) {
					if (loadGraph[hookToWaitFor] && loadGraph[hookToWaitFor].indexOf( id ) >= 0) {
						sails.log.error('Malformed hook! (' + id + ')');
						sails.log.error('Cyclic loadAfter hook dependency (' + hookToWaitFor + '). `' + hookToDefer + '` is already a loadBefore dependency - it cannot be both.');
						process.exit(1);
					}

					if (loadGraph[id].indexOf( hookToWaitFor ) < 0)
						loadGraph[id].unshift( hookToWaitFor );
				});
			}

			// Build graph for hooks that should be loaded after this one
			if (loadBefore = def.loadBefore) {
				loadBefore = loadBefore instanceof Array ? loadBefore : [loadBefore];
				loadBefore.forEach(function (hookToDefer) {
					if (loadGraph[id] && loadGraph[id].indexOf( hookToDefer ) >= 0) {
						sails.log.error('Malformed hook! (' + id + ')');
						sails.log.error('Cyclic loadBefore hook dependency (' + hookToDefer + '). `' + hookToDefer + '` is already a loadAfter dependency - it cannot be both.');
						process.exit(1);
					}

					loadGraph[hookToDefer] = loadGraph[hookToDefer] || [];
					if (loadGraph[hookToDefer].indexOf( id ) < 0)
						loadGraph[hookToDefer].unshift( id );
				});
			}
			
			// New up an actual Hook instance
			hooks[id] = new Hook(def);
		});

		// Initialize a hook by checking its dependencies and calling `load` on it
		function initializeHook (id, cb) {
			sails.log.silly('Loading hook: ' + id);

			// Check if hard dependencies are met
			var dependencies = hooks[id].dependencies;
			if (dependencies) {
				dependencies = dependencies instanceof Array ? dependencies : [dependencies];
				dependencies.forEach(function (dependency) {
					if (!hooks[dependency]) {
						return cb( Err.dependency(id, dependency) );
					}
				});
			}

			// Load the hook
			hooks[id].load(function (err) {
				if (err) {
					sails.log.error('A hook (`' + id + '`) failed to load!');
					sails.emit('hook:'+id+':error');
					return cb(err);
				}
				
				sails.log.verbose(id,'hook loaded successfully.');
				sails.emit('hook:'+id+':loaded');

				// Defer to next tick to allow other stuff to happen
				process.nextTick(cb);
			});
		}

		// Call `load` on each hook
		async.auto(loadGraph, function hooksReady (err) {
			return cb(err);
		});
	};

};
