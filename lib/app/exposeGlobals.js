module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
		async		= require('async');


	/**
	 * Make properties global if config says so
	 */

	return function exposeGlobals () {

		sails.log.verbose('Exposing global variables...');

		// Provide global access (if allowed in config)
		if (sails.config.globals._) global['_'] = _;
		if (sails.config.globals.async) global['async'] = async;
		if (sails.config.globals.sails) global['sails'] = sails;

		if (sails.config.globals.services) {
			_.each(sails.services,function (service,identity) {
				var globalName = service.globalId || service.identity;
				global[globalName] = service;
			});
		}
	};
};