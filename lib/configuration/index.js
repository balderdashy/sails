module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' );



	
	/**
	 * Expose Configuration constructor
	 */

	return Configuration;


	function Configuration () {


		/**
		 * Extend defaults with user config
		 *
		 * @api private
		 */ 

		this.build = require('./build')(sails);

		
		/**
		 * Sails default configuration
		 *
		 * @api private
		 */ 
		 
		this.defaults = require('./defaults')(sails);


		/**
		 * Normalize legacy and duplicative user config settings
		 * Validate any required properties, and throw errors if necessary.
		 * Then issue deprecation warnings and disambiguate any potentially confusing settings.
		 *
		 * @api private
		 */ 

		this.validate = require('./validate')(sails);



		/**
		 * Parses the package.json file for the Sails currently being used
		 *
		 * @api private
		 */ 

		this.package = require('./package')(sails);



		/**
		 * Load the configuration modules
		 *
		 * @api private
		 */

		this.load = require('./load')(sails);



		// Bind the context of all Configuration instance methods
		_.bindAll(this);

	}

};