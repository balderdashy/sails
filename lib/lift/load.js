var async = require('async');
var _ = require('lodash');

/**
 * Load the dependencies and app-specific components
 */
module.exports = function loadSails(cb) {

	// Get the config first
	require('./loadConfig')(function (err) {
		if (err) {
			sails.log.error('Error encountered loading config:', err);
			throw new Error(err);
		}

		loadHooks(cb);
	});
};


/**
 * 
 */
function loadHooks (cb) {

	// Build set of default hooks
	// ( NOTE: dependency list notation will eventually be pulled into the default hook modules themselves )
	var hooks = {

		configureExpress: [ require('./configureExpress') ],


		configureSocketIO: [ 'configureExpress', require('./configureSocketIO') ],


		grunt: [ require('./loadGrunt') ],


		middleware: [ require('./loadMiddleware') ],


		services: [ require('./loadServices') ],


		models: [ require('./loadModels') ],


		adapters: [ 'models', require('./loadAdapters') ],


		router: [ 'configureExpress', 'middleware', require('./loadRouter') ],


		orm: [ 'models', 'adapters', require('../orm').start ],


		globals: [ 'orm', require('./exposeGlobals') ],


		bootstrap: [ 'globals', require('./bootstrap') ]

	};

	// Mix in hooks from config
	_.extend(hooks, sails.config.hooks || {});
	
	async.auto(hooks, function (err) {
		if (err) {
			sails.log.error('Error encountered while loading Sails!');
			sails.log.error(err);
			return cb(err);
		}
		sails.log.verbose('Sails loaded successfully.');
		cb();
	});
}