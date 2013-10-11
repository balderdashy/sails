module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util			= require( '../util' );



	
	/**
	 * Expose new instance of `Configuration`
	 */

	return new Configuration();


	function Configuration () {

		
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



		// Bind the context of all instance methods
		util.bindAll(this);

	}

};