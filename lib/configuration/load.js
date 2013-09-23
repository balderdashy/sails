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

		var self = this;

		async.auto({

			loadAndBuild: function (cb) {

				// Immediately instantiate default logger in case a log-worthy event occurs 
				// before the custom logger can be initialized
				sails.log = CaptainsLog();
				
				// If appPath not specified, use process.cwd() to get the app dir
				var userConfig = {};
				userConfig.appPath = sails.config.appPath || process.cwd();

				// Save appPath as a separate variable to avoid squashing it
				var appPath = userConfig.appPath;

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

					// Mix in main app configuration modules
					var mainConfig = results[0];
					userConfig = _.merge(userConfig, mainConfig);

					// Finally, mix in app's local configuration (i.e. `config/local.js`)
					var localConfig = results[1];
					userConfig = self.build(userConfig, _.merge(userConfig, localConfig));

					// Map command line options to configurations
					if (!sails.config) {}
					else if (sails.config.dev && sails.config.prod) {
						sails.log.error('You cannot specify both production AND development!');
						throw new Error('You cannot specify both production AND development!');
					} else if (sails.config.dev) {
						sails.config = {environment: 'development'};
					} else if (sails.config.prod) {
						sails.config = {environment: 'production'};
					}

					// TODO: Extend with environment-specific config

					// Extend with whatever's in sails.config (CLI or env override)
					// userConfig = deepMerge(userConfig, sails.config);
					userConfig = _.merge(userConfig, sails.config);

					// Override the environment variable so express mirrors the sails env:
					sails.log.verbose('Setting Node environment...');
					process.env['NODE_ENV'] = sails.config.environment || userConfig.environment;

					cb(null, userConfig);
				});
			},


			validate: ['loadAndBuild', function (cb, results) {

				// Original app config (from user)
				var userConfig = results.loadAndBuild;

				// Merge user config with defaults, and run config `build` script
				var confWithDefaults	= self.defaults(userConfig),
					confAfterBuild		= self.build(confWithDefaults, userConfig);
				sails.config = _.merge(sails.config, confAfterBuild);

				// Validate user config
				sails.config = self.validate(sails.config, userConfig);

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
				var packageConfig = self.package();
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
			cb();
		});
	};

};
