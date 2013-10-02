module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util			= require('../util'),
		async			= require('async'),
		CaptainsLog		= require('../logger')(sails),
		Modules			= require('../moduleloader');

	/**
	 * Expose Configuration loader
	 *
	 * Load user config from different sources
	 * Normalize against implicit framework defaults
	 * Validate & provide backwards compat. with helpful messages
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
			 * Get the currently running installation of `sails` version/dependency info
			 * from its package.json file
			 */
			'package_json': function (cb) {
				var packageConfig	= Configuration.package();
				sails.version		= packageConfig.version;
				sails.majorVersion	= sails.version.split('.')[0].replace(/[^0-9]/g,'');
				sails.minorVersion	= sails.version.split('.')[1].replace(/[^0-9]/g,'');
				sails.dependencies	= packageConfig.dependencies;
				cb();
			},


			/**
			 *
			 */
			loadAndBuild: ['package_json', 'mapOverrides', function (cb, results) {

				// Grab reference to mapped overrides
				var overrides = results.mapOverrides;

				// Save appPath as a separate variable to avoid squashing it
				// since we'll be using it throughout the rest of the config loading process
				// (even if it gets overridden in the process)
				var appPath = overrides.appPath;

				// If appPath not specified yet, use process.cwd()
				// (the directory where this Sails process is being initiated from)
				if ( ! overrides.appPath ) {
					appPath = process.cwd();
				}

				// Load config dictionary from app modules
				async.auto([

					util.bind(Modules.aggregate, this, {
						dirname		: appPath + '/config',
						exclude		: ['locales', 'local.js', 'local.coffee'],
						excludeDirs: ['locales'],
						filter		: /(.+)\.(js|coffee)$/,
						identity	: false
					}),

					// Load local config module after everything else
					// (it's an override)
					util.bind(Modules.aggregate, this, {
						dirname		: appPath + '/config',
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

					cb(null, finalConfig);
				});
			}],


			/**
			 *
			 */
			validateConfig: ['loadAndBuild', function (cb, results) {

				// App config so far (from user)
				var userConfig = results.loadAndBuild;

				// Clone + save a copy of the userConfig for use later
				// (to provide better validation and interpret what the user was trying to do)
				var copyOfOriginalUserConfig = util.cloneDeep(userConfig);

				// Apply environment variables
				// (if the config values are not set in config files)
				userConfig.environment = userConfig.environment || process.env.NODE_ENV;
				userConfig.port = userConfig.port || process.env.PORT;

				

				// Generate implicit, built-in framework defaults for the app
				var implicitDefaults = Configuration.defaults(userConfig.appPath || process.cwd());

				// Extend copy of implicit defaults with user config
				var copyOfImplicitDefaults = util.cloneDeep(implicitDefaults);
				userConfig = util.merge(copyOfImplicitDefaults, userConfig);

				// Override the environment variable so express mirrors the sails env:
				// This is set here so that it's available BEFORE calling `build`
				// TODO: this can be moved down to the end of this module if `build` is pulled out
				// Must happen before the session is set up
				sails.log.verbose('Setting Node environment...');
				process.env['NODE_ENV'] = userConfig.environment;

				
				// Validate userConfig (all the config from the user)
				// (uses copyOfOriginalUserConfig to see what they were TRYING to do
				// and validate/warn/error properly)
				var validatedConfig = Configuration.validate(userConfig, copyOfOriginalUserConfig);

				// Just in case-- debug logging
				// function debugHack(propertyName) {
				// 	console.log(':::::::::   ' + propertyName + '   ::::::::');
				// 	console.log('sails.config ::', sails.config[propertyName]);
				// 	console.log('overrides ::', results.mapOverrides[propertyName]);
				// 	console.log('copyOfOriginalUserConfig ::', copyOfOriginalUserConfig[propertyName]);
				// 	console.log('userConfig ::', userConfig[propertyName]);
				// 	console.log('implicit defaults ::', implicitDefaults[propertyName]);
				// 	console.log('validatedConfig ::', validatedConfig[propertyName]);
				// }
				// console.log('\n\n\n\n\n');
				// console.log('*********      Sails running at ' + process.cwd() + '     *************');
				// debugHack('policies');
				// debugHack('appPath');
				// console.log('*********                               ************\n');

				cb(null, validatedConfig);
			}],



			/**
			 * Instantiate a new logger now that we have all the config loaded
			 * (since the app might actually use its own)
			 */
			logger: ['validateConfig', function (cb, results) {
				sails.log = CaptainsLog(results.validateConfig.log);
				cb();
			}]

		},


		function configLoaded (err, results) {
			if (err) {
				sails.log.error('Error encountered loading config:', err);
				return cb(err);
			}

			// Override the contents of sails.config with `validatedConfig`
			var validatedConfig = results.validateConfig;
			// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
			// TODO: do this in a cleaner way
			
			// 1. Wipe values out of `sails.config` instead of assigning a new object to it
			// so that the memory reference remains valid
			util.each(sails.config, function (value, key) {
				sails.config[key] = undefined;
			});

			// 2. Save final result back into sails.config
			util.extend(sails.config, validatedConfig);
			// ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

			cb();
		});
	};

};
