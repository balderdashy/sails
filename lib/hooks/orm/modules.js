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

				// Load app's model definitions
				// Case-insensitive, using filename to determine identity
				sails.models = Modules.optional({
					dirname		: sails.config.paths.models,
					filter		: /(.+)\.(js|coffee)$/
				});

				cb();
			},

			adapters: function (cb) {
				sails.log.verbose('Loading app adapters...');

				// Load custom adapters
				// Case-insensitive, using filename to determine identity
				sails.adapters = Modules.optional({
					dirname		: sails.config.paths.adapters,
					filter		: /(.+Adapter)\.(js|coffee)$/,
					replaceExpr	: /Adapter/
				});

				// Include default adapters automatically
				// (right now, that's just defaultAdapterName)
				sails.adapters[sails.defaultAdapterModule] = require(sails.defaultAdapterModule);

				cb();
			}

		}, cb);
	};

};
