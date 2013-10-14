module.exports = function(sails) {


	/**
	 * Module dependencies
	 */

	var util =	require('../../util'),
		async = require('async');



	/**
	 * Module loader
	 *
	 * Load a module into memory
	 */
	return {


		// Default configuration
		defaults: function (config) {
			return {

				// Paths for application modules and key files
				// If `paths.app` not specified, use process.cwd()
				// (the directory where this Sails process is being initiated from)
				paths: {
					services: config.appPath + '/api/services'
				}
			};
		},

		
		/**
		 *
		 */
		initialize: function(cb) {

			var self = this;

			async.auto({
				
				configuration: function (cb) {
					if (sails.config.hooks.userconfig) {
						sails.on('hook:userconfig:loaded', function () {
							self.configure();
							cb();
						});
					}
					else {
						self.configure();
						return cb();
					}
				},

				modules: function (cb) {

					if (sails.config.hooks.moduleloader) {

						// Load modules
						sails.on('hook:moduleloader:loaded', function moduleloaderReady () {
							return self.loadModules(cb);
						});
					}
					else return cb();
				}
			}, cb);
		},


		/**
		 *
		 */
		configure: function () {
			
			// Mix-in defaults to sails.config
			var config = util.merge( this.defaults(sails.config), sails.config );

			// Validate config
			// N/A

			// Expose new config
			sails.config = config;
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
					return;
				}

				// Expose modules
				sails.services = modules;

				cb();
			});
		}
	};
};
