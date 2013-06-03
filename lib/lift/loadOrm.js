var async = require('async');
var _ = require('lodash');

module.exports = function (cb) {
	sails.log.verbose('Loading ORM...');

	// "Resolve" adapters
	// Merge Sails' concept with the actual realities of adapter definitions in npm
	_.each(sails.models, function (model,modelIdentity) {
		_.extend(model,_.clone(resolveAdapter(model.adapter)));
	});

	// Return {} if the adapter is resolved
	function resolveAdapter (adapter, key, depth) {
		if (!depth) depth = 0;
		if (depth > 5) return adapter;

		// Return default adapter if this one is unspecified
		if (!adapter) return resolveAdapter (sails.config.adapters['default'], 'default', depth+1);

		// Try to look up adapter name in registered adapters for this app
		else if (_.isString(adapter)) {
			var lookupAttempt = sails.config.adapters[adapter];
			if (lookupAttempt) {
				return resolveAdapter (lookupAttempt, adapter, depth+1);
			}
			// If it's not a match, go ahead and wrap it in an objcet and return-- this must be a module name
			else return {adapter: adapter};
		}

		// Config was specified as an object
		else if (_.isObject(adapter)) {

			// If 'module' is specified, use that in lieu of the convenience key
			if (adapter.module) adapter.adapter = adapter.module;

			// Otherwise, use the convenience key and hope it's right!
			else adapter.adapter = key;
			return adapter;
		}

		else throw new Error('Unexpected result:  Adapter definition could not be resolved.');
	}

	// Start up waterline (ORM) and pass in adapters and models
	// as well as the sails logger and a copy of the default adapter configuration
	sails.orm = require('../orm');
	sails.orm({

		// Let waterline know about our app path
		appPath: sails.config.appPath,

		adapters: sails.adapters,

		collections: sails.models,

		log: sails.log,

		collection: {
			globalize: sails.config.globals.models
		}

	}, function (err, instantiatedModules) {
		if (err) return cb(err);

		// Make instantiated adapters and collections globally accessible
		sails.adapters = instantiatedModules.adapters;
		sails.models = sails.collections = instantiatedModules.collections;

		cb();
	});
};