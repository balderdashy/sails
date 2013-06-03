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
			userConfig = _.extend(userConfig,require('../moduleloader').aggregate({
				dirname		: userConfig.appPath + '/config',
				exclude		: ['locales', 'local.js', 'local.coffee'],
				filter		: /(.+)\.(js|coffee)$/,
				identity	: false
			}));

			// TODOS: Get locales

			// TODO: Extend with environment-specific config

			// Extend with local config
			userConfig = configuration.build(userConfig, _.extend(userConfig,require('../moduleloader').aggregate({
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
		}],


		'package.json': ['appConfig', function (cb) {

			// Extend w/ data from Sails package.json
			var packageConfig = require('../configuration/package');
			sails.version = packageConfig.version;
			sails.dependencies = packageConfig.dependencies;
			cb();
		}]

	}, cb);
};