var async = require('async');
var _ = require('lodash');

module.exports = function (cb) {
	
	async.auto({

		appConfig: function (cb) {

			var configuration = require("../configuration");

			// Immediately instantiate default logger in case a log-worthy event occurs 
			// before the custom logger can be initialized
			var CaptainsLogger = require('../util/logger');
			sails.log = CaptainsLogger();
			
			// If appPath not specified, use process.cwd() to get the app dir
			var userConfig = {};
			userConfig.appPath = userConfig.appPath || process.cwd();

			// Get config files (must be in /config)
			userConfig = _.extend(userConfig,sails.modules.aggregate({
				dirname		: userConfig.appPath + '/config',
				exclude		: ['locales', 'local.js', 'local.coffee'],
				filter		: /(.+)\.(js|coffee)$/,
				identity	: false
			}));

			// TODOS: Get locales

			// TODO: Extend with environment-specific config

			// Extend with local config
			userConfig = configuration.build(userConfig, _.extend(userConfig,sails.modules.aggregate({
				dirname		: userConfig.appPath + '/config',
				filter		: /local\.(js|coffee)$/,
				identity	: false
			})));


			// Map command line options to configurations
			if (!configOverride) {}
			else if (configOverride.dev && configOverride.prod) {
				sails.log.error('You cannot specify both production AND development!');
				process.exit(1);
			} else if (configOverride.dev) {
				configOverride = {environment: 'development'};
			} else if (configOverride.prod) {
				configOverride = {environment: 'production'};
			}

			// Extend with override
			userConfig = _.extend(userConfig,configOverride || {});

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
			
			// Apply logger config
			var CaptainsLogger = require('../util/logger');
			sails.log = CaptainsLogger(sails.config.log);
			cb();
		}],

		nodeEnv: ['appConfig', function (cb) {
			sails.log.verbose('Setting Node environment...');

			// Override the environment variable so express mirrors the sails env:
			process.env['NODE_ENV'] = sails.config.environment;
			cb();
		}]

	}, cb);
};