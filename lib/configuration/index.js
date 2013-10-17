module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('sails/lib/util'),
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
				throw new Error('No appPath specified for `lib/configuration/defaults`');
			}

			// Set up config defaults
			return {

				// Environment to run this app in; one of: ["development", "production"]
				environment: 'development',

				// Default hooks
				hooks: {
					moduleloader: require('../hooks/moduleloader'),
					request		: require('../hooks/request'),
					orm			: require('../hooks/orm'),
					views		: require('../hooks/views'),
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
					userhooks	: require('../hooks/userhooks')
				},

				// Save appPath in implicit defaults
				// appPath is passed from above in case `sails lift` was used
				// Defaults to process.cwd()
				appPath: appPath,

				// Variables which will be made globally accessible
				// (consider moving these into their separate hooks)
				globals: {
					_: true,
					async: true,
					sails: true,
					services: true,
					adapters: true,
					models: true
				},

				// Paths for application modules and key files
				// If `paths.app` not specified, use process.cwd()
				// (the directory where this Sails process is being initiated from)
				paths: {
					dependencies: appPath + '/dependencies',
					tmp: appPath + '/.tmp',
				},


				// File upload settings
				// TODO: deprecate along the road to  0.11 and the new file-parser
				fileUpload: {
					maxMB: 10
				},

				// Logging config
				log: {
					level: 'info'
				},

				// Default static-bound routes (always {})
				routes: {}

			};
		},



		/**
		 * Get information from the package.json file of the currently running installation of Sails.
		 * e.g., version/dependency info
		 *
		 * @api private
		 */ 

		this.sails_package_json = function package (cb) {
			var packageJSONPath = __dirname + '/../../package.json';
			fs.readFile(packageJSONPath, 'utf-8', function (err, json) {
				if (err) return cb(err);
				try {
					var packageConfig	= JSON.parse(json);

					// Expose version/dependency info on sails object
					sails.version		= packageConfig.version;
					sails.majorVersion	= sails.version.split('.')[0].replace(/[^0-9]/g,'');
					sails.minorVersion	= sails.version.split('.')[1].replace(/[^0-9]/g,'');
					sails.patchVersion	= sails.version.split('.')[2].replace(/[^0-9]/g,'');
					sails.dependencies	= packageConfig.dependencies;

					// Also send back package.json data
					cb(null, packageConfig);
				}
				catch (er) {
					return cb(er);
				}
			});
		};



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