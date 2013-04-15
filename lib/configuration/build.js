var _ = require('underscore');

// Extend defaults with user config
module.exports = function (defaults,userConfig) {

	var result = {};

	// For each property in user config, override all arrays and non-objects in defaults
	_.each(userConfig,function (val,key) {
		if (!_.isObject(defaults[key]) || _.isArray(defaults[key])) result[key] = val;
	});
	
	// If a property exists in defaults, but not in user config, include it
	_.defaults(result,userConfig,defaults);

	// Then extend each of the config subobjects
	result.assets	= _.extend(defaults.assets,userConfig.assets || {});
	result.session	= _.extend(defaults.session,userConfig.session || {});
	
	// Intepret session adapter config
    if (_.isObject(result.session)) {
	    if (result.session.adapter === 'memory' && !_.isObject(result.session.store)) {
	        result.session.store = new (require('express').session.MemoryStore)();
	    }
	    if (result.session.adapter === 'redis') {
	        result.session.store = new (require('connect-redis')(require('express')))(result.session);
	    }
    }

	result.cache	= _.extend(defaults.cache,userConfig.cache || {});
	result.express	= _.extend(defaults.express,userConfig.express || {});
	result.log		= _.extend(defaults.log,userConfig.log || {});
	result.globals	= _.extend(defaults.globals,userConfig.globals || {});
	result.paths	= _.extend(defaults.paths,userConfig.paths || {});
	result.adapters = _.extend(defaults.adapters,userConfig.adapters || {});

	// Only build serverOptions if SSL is specified
	// Otherwise it breaks the server for some reason in Express 2.x
	if (userConfig.ssl || (result.express && result.express.serverOptions)) {
		_.extend(result.express.serverOptions, userConfig.ssl || {});
	}

	return result;
};
