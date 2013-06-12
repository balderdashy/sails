module.exports = function (sails) {

	return {

		/**
		 * Extend defaults with user config
		 */ 

		build: require('./build')(sails),

		
		/**
		 * Sails default configuration
		 */ 
		 
		defaults: require('./defaults')(sails),


		/**
		 * Normalize legacy and duplicative user config settings
		 * Validate any required properties, and throw errors if necessary.
		 * Then issue deprecation warnings and disambiguate any potentially confusing settings.
		 */ 

		validate: require('./validate')(sails),



		/**
		 * Parses the package.json file for the Sails currently being used
		 */ 

		'package': require('./package')(sails)

	};

};