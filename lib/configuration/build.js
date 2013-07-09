module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash');
	var deepMerge = require('../util').deepMerge;

	/**
	 * Extend defaults with user config
	 */

	return function extendDefaults(defaults, userConfig) {

		var result = {};

		// For each property in user config, override all arrays and non-objects in defaults
		_.each(userConfig, function(val, key) {
			if (!_.isObject(defaults[key]) || _.isArray(defaults[key])) result[key] = val;
		});

		// If a property exists in defaults, but not in user config, include it
		// Extend default configs with user configs
		// _.defaults(result,userConfig,defaults);		
		result = deepMerge(defaults, userConfig);

		// Then extend each of the config subobjects
		result.assets = _.extend(defaults.assets, userConfig.assets || {});
		result.session = _.extend(defaults.session, userConfig.session || {});

		// Intepret session adapter config
		if (_.isObject(result.session)) {
			if (result.session.adapter === 'memory' && !_.isObject(result.session.store)) {
				result.session.store = new(require('express').session.MemoryStore)();
			}

			if (result.session.adapter === 'redis') {
				result.session.store = new(require('connect-redis')(require('express')))(result.session);
			}

			if (result.session.adapter === 'mongo') {
				result.session.store = new(require('connect-mongo')(require('express')))(result.session);
			}
		}

		result.cache = deepMerge(defaults.cache, userConfig.cache || {});
		result.express = _.extend(defaults.express, userConfig.express || {});
		result.log = deepMerge(defaults.log, userConfig.log || {});
		result.globals = deepMerge(defaults.globals, userConfig.globals || {});
		result.paths = deepMerge(defaults.paths, userConfig.paths || {});
		result.adapters = deepMerge(defaults.adapters, userConfig.adapters);
		result.io = _.extend(defaults.io, userConfig.io || {});
		result.controllers = deepMerge(defaults.controllers, userConfig.controllers || {});
		result.views = _.extend(defaults.views, userConfig.views || {});

		// Only build serverOptions if SSL is specified
		// Otherwise it breaks the server for some reason in Express 2.x
		if (userConfig.ssl || (result.express && result.express.serverOptions)) {
			_.extend(result.express.serverOptions, userConfig.ssl || {});
		}

		return result;
	};
};