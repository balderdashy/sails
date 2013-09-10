module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var util = require('../../util'),
		async = require('async'),
		Modules = require('../../moduleloader');


	return function (cb) {

		/**
		 * Expose Hook definition
		 */

		async.auto({

			models: function(cb) {
				sails.log.verbose('Loading app models...');

				sails.models = {};

				// Load app's model definitions
				// Case-insensitive, using filename to determine identity
				Modules.optional({
					dirname		: sails.config.paths.models,
					filter		: /(.+)\.(js|coffee)$/
				}, function modulesLoaded (err, modules) {
					if (err) return cb(err);
					sails.models = modules;
					return cb();
				});
			},

			adapters: function (cb) {
				sails.log.verbose('Loading app adapters...');

				sails.adapters = {};

				// Load custom adapters
				// Case-insensitive, using filename to determine identity
				Modules.optional({
					dirname		: sails.config.paths.adapters,
					filter		: /(.+Adapter)\.(js|coffee)$/,
					replaceExpr	: /Adapter/
				}, function modulesLoaded (err, modules) {
					if (err) return cb(err);

					// Include default adapter automatically (defaultAdapterName)
					sails.adapters[sails.defaultAdapterModule] = require(sails.defaultAdapterModule);
					
					// Mix in custom adapters last, since they should override built-ins
					util.extend(sails.adapters, modules);

					return cb();
				});
			}

		}, cb);
	};

};
