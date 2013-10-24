module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util			= require('../util'),
		async			= require('async'),
		CaptainsLog		= require('../logger')(sails);


	/**
	 * Expose Configuration loader
	 *
	 * Load user config from different sources
	 * Normalize against implicit framework defaults
	 * Instantiate some key framework components which live in sails.config (todo: move this part out)
	 *
	 * For reference, config priority is:
	 * --> implicit defaults
	 * --> environment variables
	 * --> user config files
	 * --> local config file
	 * --> configOverride ( in call to sails.lift() )
	 * --> --cmdline args
	 */

	return function loadConfig (cb) {

		// Save reference to context for use in closures
		var Configuration = this;

		// Immediately instantiate the default logger in case a log-worthy event occurs 
		// before the custom logger can be initialized
		// NOTE: This will be replaced later by the configured logger.
		sails.log = CaptainsLog();


		// Ensure sails.config exists
		sails.config = sails.config || {};


		// Commence with loading/validating/defaulting all the rest of the config
		async.auto({

			/**
			 * At this point, sails.config is composed of config from:
			 * + env variables
			 * + command line flags
			 * + options passed into sails.load() / sails.lift()
			 *
			 * This step clones this into an "overrides" object
			 * and normalizes/validates it
			 */
			mapOverrides: function (cb) {

				// TODO: move this into `lib/app/load` instead

				// Take the overrides + app path
				// and clone and save them for later
				var overrides = util.cloneDeep(sails.config);

				// Map command line shortcut options to proper configuration
				// Only needs to be done for command-line or ENV overrides 
				// which do not match their configuration file equivalents
				if (sails.config.dev && sails.config.prod) {
					var err = new Error ('You cannot specify both production AND development!');
					sails.log.error(err);
					throw err;
				}
				if (overrides.dev) {
					overrides.environment = 'development';
				}
				if (overrides.prod) {
					overrides.environment = 'production';
				}
				if (overrides.verbose) {
					overrides.log = { level: 'verbose' };
				}

				// Pass on overrides object
				cb(null, overrides);
			},

			/**
			 * Get information from the package.json file of the currently running installation of Sails.
			 */
			package_json: function (cb) {
				Configuration.sails_package_json(cb);
			},


			/**
			 * 
			 */
			mixinDefaults: function (cb, results) {

				// Get overrides
				var overrides = results.mapOverrides; //util.cloneDeep(results.mapOverrides);

				// Apply environment variables
				// (if the config values are not set in overrides)
				overrides.environment = overrides.environment || process.env.NODE_ENV;
				overrides.port = overrides.port || process.env.PORT;

				// Generate implicit, built-in framework defaults for the app
				var implicitDefaults = Configuration.defaults(overrides.appPath || process.cwd());

				// Extend copy of implicit defaults with user config
				var mergedConfig =
					util.merge(
						util.cloneDeep(implicitDefaults),
						overrides);

				// Override the environment variable so express and other modules 
				// which expect NODE_ENV to be set mirror the configured Sails environment.
				sails.log.verbose('Setting Node environment...');
				process.env['NODE_ENV'] = mergedConfig.environment;				

				cb(null, mergedConfig);
			},



			/**
			 * Instantiate a new logger now that we have all the config loaded
			 * (since the app might actually use its own)
			 *
			 * TODO: move to hook so that it can inherits userconfig
			 */
			logger: ['mixinDefaults', function (cb, results) {
				sails.log = CaptainsLog(results.mixinDefaults.log);
				cb();
			}]

		},


		function configLoaded (err, results) {
			if (err) {
				sails.log.error('Error encountered loading config:', err);
				return cb(err);
			}

			// Override the contents of sails.config with `validatedConfig`
			sails.config = results.mixinDefaults;
			cb();
		});
	};

};
