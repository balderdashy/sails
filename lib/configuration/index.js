module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('sails-util'),
		fs		= require('fs');



	
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
		 
		this.defaults = function defaultConfig (appPath) {
		
			// If `appPath` not specified, unfortunately, this is a fatal error,
			// since reasonable defaults cannot be assumed
			if ( !appPath) {
				throw new Error('No `appPath` specified!');
			}

			// Set up config defaults
			return {

				// Environment to run this app in; one of: ["development", "production"]
				// TODO: remove environment from config to avoid confusion
				// (you can't configure it in user config-- only overrides, CLI args, or NODE_ENV)
				environment: 'development',

		
				// Default hooks
				// TODO: remove hooks from config to avoid confusion
				// (NOTE: you can't configure hooks in `userconfig`-- only in `overrides`)
				hooks: {
					moduleloader: require('../hooks/moduleloader'),
					request		: require('../hooks/request'),
					orm			: require('../hooks/orm'),
					views		: require('../hooks/views'),
					blueprints	: require('../hooks/blueprints'),
					responses	: require('../hooks/responses'),
					controllers	: require('../hooks/controllers'),
					sockets		: require('../hooks/sockets'),
					pubsub		: require('../hooks/pubsub'),
					policies	: require('../hooks/policies'),
					services	: require('../hooks/services'),
					csrf		: require('../hooks/csrf'),
					cors		: require('../hooks/cors'),
					i18n		: require('../hooks/i18n'),
					userconfig	: require('../hooks/userconfig'),
					session		: require('../hooks/session'),
					grunt		: require('../hooks/grunt'),
					http		: require('../hooks/http'),
					userhooks	: require('../hooks/userhooks'),
					logger		: require('../hooks/logger')
				},

				// Save appPath in implicit defaults
				// appPath is passed from above in case `sails lift` was used
				// This is the directory where this Sails process is being initiated from.
				// (  usually this means `process.cwd()`  )
				appPath: appPath,

				// Variables which will be made globally accessible
				// (if `globals:false` is set, all globals will be disabled)
				globals: {
					_: true,
					async: true,
					sails: true
				},

				// Built-in path defaults
				paths: {
					tmp: appPath + '/.tmp'
				},

				// Start off `routes` and `middleware` as empty objects
				routes: {},
				middleware: {},

				// By default, any time a model instance is found using blueprints,
				// the requesting socket (if any) will be subscribed to the instance
				models: {
					autosubscribe: true
				}

			};
		},



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