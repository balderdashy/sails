/**
 * Module dependencies
 */

var _ = require('lodash');




module.exports = function(sails) {

	/**
	 * Module loader
	 *
	 * Load a module into memory
	 */
	return {


		// Default configuration
		defaults: {

			globals: {
				services: true
			}
		},


		/**
		 * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
		 */
		loadModules: function (cb) {

			sails.log.verbose('Loading app services...');
			sails.modules.loadServices(function (err, modules) {
				if (err) {
					sails.log.error('Error occurred loading modules ::');
					sails.log.error(err);
					return cb(err);
				}

				// Expose modules on `sails`
				sails.services = modules;

				// Expose globals (if enabled)
				if (sails.config.globals.services) {
					_.each(sails.services,function (service,identity) {
						var globalName = service.globalId || service.identity;
						global[globalName] = service;
					});
				}

				cb();
			});
		}
	};
};
