module.exports = function(sails) {


	/**
	 * Module dependencies
	 */

	var util =	require('sails/lib/util'),
		async = require('async');



	/**
	 * Module loader
	 *
	 * Load a module into memory
	 */
	return {


		// Default configuration
		defaults: {},

		
		/**
		 *
		 */
		initialize: function(cb) {
			cb();
		},


		/**
		 * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
		 */
		loadModules: function (cb) {

			sails.log.verbose('Loading app services...');
			sails.hooks.moduleloader.optional({
				dirname			: sails.config.paths.services,
				filter			: /(.+)\.(js|coffee)$/,
				caseSensitive	: true
			}, function (err, modules) {
				if (err) {
					sails.log.error('Error occurred loading modules ::');
					sails.log.error(err);
					return cb(err);
				}

				// Expose modules
				sails.services = modules;

				cb();
			});
		}
	};
};
