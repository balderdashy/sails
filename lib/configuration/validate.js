module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _		= require('lodash'),
		fs		= require('fs'),
		Session	= require('../session')(sails);



	/** 
	 * Make sure existsSync does not crash on older versions of Node
	 */

	fs.existsSync = fs.existsSync || require('path').existsSync;


	/**
	 * Normalize legacy and duplicative user config settings
	 * Validate any required properties, and throw errors if necessary.
	 * Then issue deprecation warnings and disambiguate any potentially confusing settings.
	 */ 

	return function validateConfiguration (config, originalUserConfig) {

		// Provide `mock` escape route for unit tests and CLI tool
		if (originalUserConfig.mock) {
			return config;
		}
		
		var log = (typeof sails !== 'undefined' && sails.log) || console;

		if(!originalUserConfig) {
			throw new Error('No configuration specified!');
		} 

		// Adapter registration
		/////////////////////////////////////////////

		var defaultAdapter = config.adapters['default'];
		if (defaultAdapter && _.isString(defaultAdapter)) {
			config.adapters['default'] = config.adapters[defaultAdapter];
		}
		else if (!_.isObject(defaultAdapter) || _.isArray(defaultAdapter) || !defaultAdapter.module) {
			throw new Error ('Invalid default adapter configuration.\n Must be a string or a valid config object containing at least a `module` property.');
		}

		
		// Required options
		/////////////////////////////////////////////

		// Ensure that secret is specified if a custom session store is used
		if(originalUserConfig.session) {
			if(!_.isObject(originalUserConfig.session)) {
				throw new Error('Invalid session store configuration!\n' + 
					'Should be of the form: { store: someStore, secret: `someVerySecureString` }');
			}

		}
		if(!originalUserConfig.session || (originalUserConfig && !originalUserConfig.session.secret)) {
			log.warn('Session secret must be identified!\n' + 
				'Should be of the form: { secret: `someVerySecureString` }' +
				'\nAutomatically generating one for now...' +
				'\n(Note: This will change each time the server starts and break multi-instance deployments.)'+
				'\ne.g. You can set this by adding the following to one of the modules in your app config directory:'+
				'\nmodule.exports.session = { secret: `keyboardcat` }');
			config.session.secret = Session.generateSecret();
		}

		// If ssl config is specified, ensure all pieces are there
		if(!_.isUndefined(originalUserConfig.ssl)) {
			if(!config.ssl || !config.ssl.cert || !config.ssl.key) {
				throw new Error('Invalid SSL config object!  Must include cert and key!');
			}
		}


		/**
		 * Deprecation warnings / config auto-migrations
		 */

		if (originalUserConfig.viewEngine) {
			log.warn('The `sails.config.viewEngine` config has been deprecated in favor of `sails.config.views.engine`.');
			log.warn('It has been automatically migrated, but you\'ll continue to see this warning until you change your configuration files.');
			config.views.engine = config.viewEngine;
		}

		/**
		 * All consolidate-compatibile views are supported
		 */

		// var allowedViewEngines = [
		// 	'ejs', 'jade', 'handlebars', 'hbs'
		// ];
		// if (allowedViewEngines.indexOf(config.views.engine) === -1) {
		// 	log.error('Sorry, only the ejs, jade and handlebars view engines are supported at this time.  You specified: ' + config.views.engine)
		// }

		// Let user know that a leading . is not required in the viewEngine option and then fix it
		if (config.views.engine[0] === '.') {
			log.warn('A leading `.` is not required in the views.engine option.  Removing it for you...');
			config.views.engine = config.views.engine.substr(1);
		}

		// // Ignore invalid items in assets sequence
		// _.each(config.assets.sequence, function(item,index) {
		// 	try {
		// 		var inode = require('fs').statSync(item);

		// 		// Validate that this is a directory
		// 		if(!inode.isDirectory()) {
		// 			log.warn('Ignoring: '+item+' (files are not allowed in assets.sequence in development mode-- only directories.)  Please check your configuration.');
		// 			config.assets.sequence.splice(index,1);
		// 		}

		// 	} catch(e) {
		// 		log.warn('Ignoring: '+item+' (listed in assets.sequence but does not exist.)  Please check your configuration.');
		// 		config.assets.sequence.splice(index,1);
		// 	}
		// });

		// Deprecation warnings
		/////////////////////////////////////////////

		// Upgrade to the new express config object
		if (originalUserConfig.serverOptions) {
			log.warn('serverOptions has been deprecated in favor of the new express configuration option.');
			log.warn('Please replace serverOptions={foo:`bar`} with express.serverOptions={foo:`bar`}.');
			config.express.serverOptions = config.serverOptions;
		}
		if (originalUserConfig.customMiddleware) {
			log.warn('customMiddleware has been deprecated in favor of the new express configuration option.');
			log.warn('Please replace customMiddleware=foo with express.customMiddleware=foo.');
			config.express.customMiddleware = config.customMiddleware;
		}


		// Legacy support
		/////////////////////////////////////////////



		// // Support old adapter module names
		// DEPRECTATED
		// _.each({
		// 	'waterline-dirty': 'sails-dirty',
		// 	'waterline-mysql': 'sails-mysql'
		// }, function (newModuleName, oldModuleName) {
		// 	var warning = 'The ''+oldModuleName+'' adapter module is now called ''+newModuleName+''.  Please update your config and run npm install.';
			
		// 	// Fix adapter module names in config
		// 	_.each(sails.config.adapters, function adjustAdapterConfig(def, label) {
		// 		if (def === oldModuleName) {
		// 			def = newModuleName;
		// 			log.warn(warning);
		// 		}
		// 		else if (def && (def.module === oldModuleName)) {
		// 			def.module = newModuleName;
		// 			log.warn(warning);
		// 		}
		// 	});

		// 	// Fix adapter module names in config
		// 	_.each(sails.models, function adjustModelAdapters(def, label) {
		// 		if (def.adapter === oldModuleName) {
		// 			def.adapter = newModuleName;
		// 			log.warn(warning);
		// 		}
		// 	});
		// });

		// Add backwards compatibility for older versions of Sails 
		// that rely on waterline-* adapter modules
		if (sails.version === '0.8.82') {
			sails.defaultAdapterModule = 'waterline-dirty';
		}
		else sails.defaultAdapterModule = 'sails-disk';


		// Support old rigging config
		if (originalUserConfig.rigging) {
			var riggingError = 
				'`rigging` and `asset-rack` have been deprecated in favor of `grunt`' + 
				'\nPlease check out the sails.js v0.9 migration guide for more information.';
			log.error(riggingError);
			throw new Error(riggingError);
		}

		// Check that policies path exists-- if it doesn't, try middleware
		var policiesPathExists = fs.existsSync(config.paths.policies);
		if (!policiesPathExists) {

			// If middleware DOES exist, issue a deprecation warning
			var inferredMiddlewarePath = config.appPath + '/api/middleware';
			var middlewarePathExists = fs.existsSync(inferredMiddlewarePath);
			if (middlewarePathExists) {
				log.warn('The `middleware` directory has been deprecated in favor of `policies`.'+
					'\nPlease rename your `middleware` directory to `policies`.');
				config.paths.policies = inferredMiddlewarePath;
			}

			// Otherwise, we're fine, there's no policies OR middleware-- no ambiguity.
		}

		// Check that policies config is labeled appropriately (not policy)
		if (sails.config.policy) {
			log.warn('The `policy.js` config file is now `policies.js`.');
			_.extend(sails.config.policies || {}, sails.config.policy);
		}

		// Disambiguations
		/////////////////////////////////////////////

		// If host is explicitly specified, set sails.explicitHost
		// (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
		if (originalUserConfig.host) {
			sails.explicitHost = originalUserConfig.host;
		}

		// Issue warning if cache settings are specified, but this is development mode (cache is always off in development mode)
		if (config.environment === 'development' && originalUserConfig.cache) {
			log.warn('NOTE: Even though a cache configuration is specified, cache is always off when your app is in development mode.');
		}

		// Express serverOptions override ssl, but just for the http server
		if (originalUserConfig.ssl && 
			(originalUserConfig.express && originalUserConfig.express.serverOptions && (originalUserConfig.express.serverOptions.cert || originalUserConfig.express.serverOptions.key))) {
			log.warn('You specified the ssl option, but there are also ssl options specified in express.serverOptions.'+
						'The global ssl options will be used for the websocket server, but the serverOptions values will be used for the express HTTP server.');
			config = _.recursive.defaults(config.express.serverOptions,config.ssl);
		}


		// Return marshalled session object
		/////////////////////////////////////////////
		return config;
	};

};
