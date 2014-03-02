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


		// Globals explicitly disabled
		if ( !sails.config.globals ) {
			return;
		}

		// Provide global access (if allowed in config)
		if (sails.config.globals._) {
			global['_'] = _;
		}
		if (sails.config.globals.async) {
			global['async'] = async;
		}
		if (sails.config.globals.sails) {
			global['sails'] = sails;
		}


		// `services` hook takes care of globalizing services (if enabled)

		// `orm` hook takes care of globalizing models and adapters (if enabled)

		
	};
};