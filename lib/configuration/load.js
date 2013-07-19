module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
	async			= require('async'),
	CaptainsLog		= require('../logger')(sails),
	ModuleLoader	= require('../moduleloader'),
	deepMerge		= require('../util').deepMerge;

	/**
	 * Expose Configuration loader
	 */

	return function (cb) {

		var self = this;

		async.auto({

			appConfig: function (cb) {

				// Immediately instantiate default logger in case a log-worthy event occurs 
				// before the custom logger can be initialized
				sails.log = CaptainsLog();
				
				// If appPath not specified, use process.cwd() to get the app dir
				var userConfig = {};
				userConfig.appPath = userConfig.appPath || process.cwd();

				// Get config files (must be in /config)
				userConfig = _.extend(userConfig, ModuleLoader.aggregate({
					dirname		: userConfig.appPath + '/config',
					exclude		: ['locales', 'local.js', 'local.coffee'],
					excludeDirs: ['locales'],
					filter		: /(.+)\.(js|coffee)$/,
					identity	: false
				}));

				// TODO: Extend with environment-specific config

				// Extend with local config
				userConfig = self.build(userConfig, _.extend(userConfig, ModuleLoader.aggregate({
					dirname		: userConfig.appPath + '/config',
					filter		: /local\.(js|coffee)$/,
					identity	: false
				})));


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

				// Extend with whatever's in sails.config (CLI or env override)
				userConfig = deepMerge(userConfig, sails.config);

				// Override the environment variable so express mirrors the sails env:
				sails.log.verbose('Setting Node environment...');
				process.env['NODE_ENV'] = sails.config.environment || userConfig.environment;

				// Merge user config with defaults
				sails.config = deepMerge(sails.config, self.build(self.defaults(userConfig), userConfig));


				// Validate user config
				sails.config = self.validate(sails.config, userConfig);


				// Expose route config and policy tree, and mixin defaults
				sails.config.policies = deepMerge({ "*" : true }, _.clone(sails.config.policies));
				sails.routes = sails.config.routes || {};

				cb();
			},

			logger: ['appConfig', function (cb) {
				
				// Rebuild logger using app config
				sails.log = CaptainsLog(sails.config.log);
				cb();
			}],

			'package.json': ['appConfig', function (cb) {

				// Extend w/ data from Sails package.json
				var packageConfig = self.package();
				sails.version = packageConfig.version;
				sails.majorVersion = sails.version.split('.')[0].replace(/[^0-9]/g,'');
				sails.minorVersion = sails.version.split('.')[1].replace(/[^0-9]/g,'');
				sails.dependencies = packageConfig.dependencies;
				cb();
			}]

		}, function (err) {
			if (err) {
				sails.log.error('Error encountered loading config:', err);
				return cb(err);
			}
			cb();
		});
	};

};
