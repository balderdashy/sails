module.exports = function(sails) {

	/**
	 * Module dependencies.
	 */

	var util = require('../util');
	var deepMerge = util.deepMerge;

	/**
	 * Extend defaults with user config
	 */

	return function extendDefaults(defaults, userConfig) {

		var result = {};

		// For each property in user config, override all arrays and non-objects in defaults
		util.each(userConfig, function(val, key) {
			if (!util.isObject(defaults[key]) || util.isArray(defaults[key])) result[key] = val;
		});

		// If a property exists in defaults, but not in user config, include it
		// Extend default configs with user configs
		// util.defaults(result,userConfig,defaults);		
		result = deepMerge(defaults, userConfig);

		// Then extend each of the config subobjects
		result.assets = util.extend(defaults.assets, userConfig.assets || {});
		result.session = util.extend(defaults.session, userConfig.session || {});

		// Intepret session adapter config
		if (util.isObject(result.session)) {
			if (result.session.adapter === 'memory' && !util.isObject(result.session.store)) {
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
		result.express = util.extend(defaults.express, userConfig.express || {});
		result.log = deepMerge(defaults.log, userConfig.log || {});
		result.globals = deepMerge(defaults.globals, userConfig.globals || {});
		result.paths = deepMerge(defaults.paths, userConfig.paths || {});
		result.adapters = deepMerge(defaults.adapters, userConfig.adapters);
		result.io = util.extend(defaults.io, userConfig.io || {});
		result.controllers = deepMerge(defaults.controllers, userConfig.controllers || {});
		result.views = util.extend(defaults.views, userConfig.views || {});

		// Only build serverOptions if SSL is specified
		// Otherwise it breaks the server for some reason
		// TODO: see if this happens in Express 3.x
		if (userConfig.ssl || (result.express && result.express.serverOptions)) {
			util.extend(result.express.serverOptions, userConfig.ssl || {});
		}


		// Custom layout location (true defaults to layout.*)
		if ( !util.isString(userConfig.views.layout) && userConfig.views.layout ) {
			result.views.layout = 'layout.' + result.views.engine;
		}

		return result;
	};
};