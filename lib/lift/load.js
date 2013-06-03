var async = require('async');
var _ = require('lodash');

/**
 * Load the dependencies and app-specific components
 */
module.exports = function loadSails(cb) {

	// Load various pieces of framework
	async.auto({

		config: require('./loadConfig'),		


		configureExpress: ['config', require('./configureExpress')],


		configureSocketIO: ['config', 'configureExpress', require('./configureSocketIO')],


		grunt: ['config', require('./loadGrunt')],


		middleware: ['config', require('./loadMiddleware')],


		services: ['config', require('./loadServices')],


		models: ['config', require('./loadModels')],


		adapters: ['config', 'models', require('./loadAdapters')],


		router: ['config', 'configureExpress', 'middleware', require('./loadRouter')],


		orm: ['config', 'models', 'adapters', require('./loadOrm')],


		globals: ['orm', require('./exposeGlobals')],


		bootstrap: ['globals', require('./bootstrap')]

	}, function (err) {
		if (err) {
			sails.log.error('Error encountered while loading Sails!');
			sails.log.error(err);
			return cb(err);
		}
		sails.log.verbose('Sails loaded successfully.');
		cb();
	});
};