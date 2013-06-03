var async = require('async');
var _ = require('lodash');

/**
 * Load the dependencies and app-specific components
 */
module.exports = function loadSails(configOverride, cb) {

	// Load various pieces of framework
	async.auto({


		config: require('./loadConfig'),		


		models: ['config', require('./loadModels')],


		grunt: ['config', require('./loadGrunt')],


		adapters: ['config', 'models', require('./loadAdapters')],


		orm: ['config', 'models', 'adapters', require('./loadOrm')],


		services: ['orm', require('./loadServices')],


		globals: ['services', require('./exposeGlobals')],


		middleware: ['orm', require('./loadMiddleware')],


		bootstrap: ['orm', 'middleware', 'globals', require('./bootstrap')]

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