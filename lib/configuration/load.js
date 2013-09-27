module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
	async			= require('async'),
	CaptainsLog		= require('../logger')(sails),
	Modules			= require('../moduleloader'),
	deepMerge		= require('../util').deepMerge; // todo: use lodash deepmerge instead

	/**
	 * Expose Configuration loader
	 */

	return function (cb) {

		var Configuration = this;

		async.auto({

			loadAndBuild: function (cb) {

				// Immediately instantiate default logger in case a log-worthy event occurs 
				// before the custom logger can be initialized
				sails.log = CaptainsLog();

				// At this point, sails.config is composed of config from:
				// + env variables
				// + command line flags
				// + options passed into sails.load() / sails.lift()

				// If appPath not specified yet, set it to process.cwd()
				// (the directory where this Sails process is being initiated from)
				if ( ! sails.config.appPath ) {
					sails.config.appPath = process.cwd();
				}

				// Save appPath as a separate variable to avoid squashing it
				// since we'll be using it throughout the rest of the config loading process
				// (even if it gets overridden in the process)
				var appPath = sails.config.appPath;
				
				// Take the overrides + app path
				// and clone and save them
				var overrides = _.clone(sails.config);

				// TODO: Why is this here?
				// Map command line options to configurations
				// if (!sails.config) {}
				// else if (sails.config.dev && sails.config.prod) {
				// 	sails.log.error('You cannot specify both production AND development!');
				// 	throw new Error('You cannot specify both production AND development!');
				// } else if (sails.config.dev) {
				// 	sails.config = {environment: 'development'};
				// } else if (sails.config.prod) {
				// 	sails.config = {environment: 'production'};
				// }

				

				// Load config dictionary from app modules
				async.auto([

					_.bind(Modules.aggregate, this, {
						dirname		: appPath + '/config',
						exclude		: ['locales', 'local.js', 'local.coffee'],
						excludeDirs: ['locales'],
						filter		: /(.+)\.(js|coffee)$/,
						identity	: false
					}),

					// Load local config module after everything else
					// (it's an override)
					_.bind(Modules.aggregate, this, {
						dirname		: appPath + '/config',
						filter		: /local\.(js|coffee)$/,
						identity	: false
					})

				], function loadedAppConfigModules (err, results) {
					if (err) return cb(err);

					var newConfig = {};

					// Take config from app config files
					// and extend that with the override stuff (command-line, environment, blah blah)
					var configFilesFromApp = results[0];
					newConfig = configFilesFromApp;

					// Finally, mix in app's local configuration (i.e. `config/local.js`)
					var localConfig = results[1];
					var withLocalConfig = _.merge(newConfig, localConfig);

					// Run the mysterious Configuration.build????!
					// TODO: probably could be removed
					newConfig = Configuration.build(newConfig, withLocalConfig);


					// Extend with whatever's in sails.config (CLI or env override)
					// userConfig = deepMerge(userConfig, sails.config);
					newConfig = _.merge(newConfig, overrides);

					// Override the environment variable so express mirrors the sails env:
					sails.log.verbose('Setting Node environment...');
					process.env['NODE_ENV'] = sails.config.environment || newConfig.environment;


					// TODO: Figure out this monkey nest and just stuff it in sails.config at this point

					cb(null, newConfig);
				});
			},


			validate: ['loadAndBuild', function (cb, results) {

				// App config so far (from user)
				var userConfig = results.loadAndBuild;

				// Clone + save a copy of the config from the user for later
				var copyOfOriginalUserConfig = _.clone(userConfig);

				// Generating implicit, built-in framework defaults for the app
				var implicitDefaults = Configuration.defaults(userConfig.appPath);

				// Run the mysterious Configuration.build????!
				// to fill in missing things
				var userConfigAfterBuild = Configuration.build(implicitDefaults, userConfig);
				
				// Merge that back into sails.config
				// TODO: sails.config at this point is actually just overrides, wtf?!
				_.merge(sails.config, userConfigAfterBuild);

				// Validate userConfig (all the config from the user)
				// and save result back into sails.config
				//
				// (uses copyOfOriginalUserConfig to see what they were TRYING to do
				// and validate/warn/error properly)
				sails.config = Configuration.validate(sails.config, copyOfOriginalUserConfig);

				// Expose route config and policy tree, and mixin defaults
				var policiesClone = _.clone(sails.config.policies);
				sails.config.policies = _.merge({ "*" : true }, policiesClone);
				sails.routes = sails.config.routes || {};

				cb();
			}],



			logger: ['validate', function (cb) {
				
				// Rebuild logger using app config
				sails.log = CaptainsLog(sails.config.log);
				cb();
			}],



			'package.json': ['validate', function (cb) {

				// Extend w/ data from Sails package.json
				var packageConfig = Configuration.package();
				sails.version = packageConfig.version;
				sails.majorVersion = sails.version.split('.')[0].replace(/[^0-9]/g,'');
				sails.minorVersion = sails.version.split('.')[1].replace(/[^0-9]/g,'');
				sails.dependencies = packageConfig.dependencies;
				cb();
			}]

		},


		function configLoaded (err) {
			if (err) {
				sails.log.error('Error encountered loading config:', err);
				return cb(err);
			}

			console.log('\n\n\n\nEnv:', sails.config.environment);
			cb();
		});
	};

};
