module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
	async			= require('async'),
	configuration	= require("../configuration")(sails),
	CaptainsLog		= require('../util/logger')(sails),
	ModuleLoader	= require('../moduleloader');

	
	/**
	 * Expose Application configuration
	 */

	return function Configuration (cb) {

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
					filter		: /(.+)\.(js|coffee)$/,
					identity	: false
				}));

				// TODO: Extend with environment-specific config

				// Extend with local config
				userConfig = configuration.build(userConfig, _.extend(userConfig, ModuleLoader.aggregate({
					dirname		: userConfig.appPath + '/config',
					filter		: /local\.(js|coffee)$/,
					identity	: false
				})));


				// Map command line options to configurations
				if (!sails.config) {}
				else if (sails.config.dev && sails.config.prod) {
					sails.log.error('You cannot specify both production AND development!');
					process.exit(1);
				} else if (sails.config.dev) {
					sails.config = {environment: 'development'};
				} else if (sails.config.prod) {
					sails.config = {environment: 'production'};
				}

				// Extend with whatever's in sails.config (CLI or env override)
				userConfig = _.extend(userConfig, sails.config || {});

				// Merge user config with defaults
				sails.config = _.extend(sails.config,configuration.build(configuration.defaults(userConfig), userConfig));

				// Validate user config
				sails.config = configuration.validate(sails.config, userConfig);


				// Expose route config and policy tree, and mixin defaults
				sails.config.policies = _.extend({ "*" : true },sails.config.policies);
				sails.routes = _.extend({},sails.config.routes);

				cb();
			},

			logger: ['appConfig', function (cb) {
				
				// Rebuild logger using app configuration
				sails.log = CaptainsLog(sails.config.log);
				cb();
			}],

			nodeEnv: ['appConfig', function (cb) {
				sails.log.verbose('Setting Node environment...');

				// Override the environment variable so express mirrors the sails env:
				process.env['NODE_ENV'] = sails.config.environment;
				cb();
			}],


			'package.json': ['appConfig', function (cb) {

				// Extend w/ data from Sails package.json
				var packageConfig = configuration.package();
				sails.version = packageConfig.version;
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
