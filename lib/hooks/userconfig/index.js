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
		 * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
		 */
		loadModules: function (cb) {

			sails.log.verbose('Loading app config...');

			// Grab reference to mapped overrides
			var overrides = util.cloneDeep(sails.config);


			// If appPath not specified yet, use process.cwd()
			// (the directory where this Sails process is being initiated from)
			if ( ! overrides.appPath ) {
				sails.config.appPath = process.cwd();
			}

			// Load config dictionary from app modules
			async.auto([

				util.bind(sails.modules.aggregate, this, {
					dirname		: sails.config.appPath + '/config',
					exclude		: ['locales', 'local.js', 'local.coffee'],
					excludeDirs: ['locales'],
					filter		: /(.+)\.(js|coffee)$/,
					identity	: false
				}),

				// Load local config module after everything else
				// (it's an override)
				util.bind(sails.modules.aggregate, this, {
					dirname		: sails.config.appPath + '/config',
					filter		: /local\.(js|coffee)$/,
					identity	: false
				})

			], function loadedAppConfigModules (err, results) {
				if (err) return cb(err);

				// Start building the final config object
				var finalConfig = {};

				// Take config from app config files
				// and extend that with the override stuff (command-line, environment, blah blah)
				var configFilesFromApp = results[0];
				finalConfig = configFilesFromApp;

				// Finally, mix in app's local configuration (i.e. `config/local.js`)
				var localConfig = results[1];
				var withLocalConfig = util.merge(finalConfig, localConfig);

				// Finally, extend user config with overrides
				finalConfig = util.merge(withLocalConfig, overrides);

				// Save final config into sails.config
				sails.config = finalConfig;

				cb();
			});
		}
	};
};
