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

		sails.log.verbose('Exposing global variables... (you can disable this by modifying the properties in `sails.config.globals`)');

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

		// Waterline takes care of globalizing models and adapters
		// TODO:	move that stuff in here instead so that all globalization 
		//			happens in one place

		
	};
};