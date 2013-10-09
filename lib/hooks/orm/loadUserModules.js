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

		sails.log.verbose('Loading the app\'s models and adapters...');
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
					sails.adapters = modules;
					return cb();
				});
			}

		}, cb);
	};

};