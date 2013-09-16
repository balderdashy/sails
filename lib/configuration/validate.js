module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('../util'),
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
		if (defaultAdapter && util.isString(defaultAdapter)) {
			config.adapters['default'] = config.adapters[defaultAdapter];
		}
		else if (!util.isObject(defaultAdapter) || util.isArray(defaultAdapter) || !defaultAdapter.module) {
			throw new Error ('Invalid default adapter configuration.\n Must be a string or a valid config object containing at least a `module` property.');
		}

		
		// Required options
		/////////////////////////////////////////////

		// Ensure that secret is specified if a custom session store is used
		if(originalUserConfig.session) {
			if(!util.isObject(originalUserConfig.session)) {
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
		if(!util.isUndefined(originalUserConfig.ssl)) {
			if(!config.ssl || !config.ssl.cert || !config.ssl.key) {
				throw new Error('Invalid SSL config object!  Must include cert and key!');
			}
		}

		// onConnect must be valid function
		if (config.sockets.onConnect && typeof config.sockets.onConnect !== 'function') {
			throw new Error('Invalid `sails.config.sockets.onConnect`!  Must be a function.');
		}



		/**
		 * View Engine
		 */

		if (originalUserConfig.viewEngine) {
			log.warn('The `sails.config.viewEngine` config has been deprecated in favor of `sails.config.views.engine`.');
			log.warn('It has been automatically migrated, but you\'ll continue to see this warning until you change your configuration files.');
			config.views.engine = config.viewEngine;
		}

		// Normalize view engine config
		if (typeof config.views.engine === 'string') {
			var viewExt = config.views.engine;
			sails.config.views.engine = {
				ext: viewExt
			};
		}

		// Ensure valid config
		if (! (config.views.engine && config.views.engine.ext) ) {
			sails.log.error('Invalid view engine configuration. `config.views.engine` should');
			sails.log.error('be set to either a `string` or an `object` with the following properties:');
			sails.log.error('    {');
			sails.log.error('        ext: <string>,   // the file extension');
			sails.log.error('        fn: <function>   // the template engine render function');
			sails.log.error('    }');
			sails.log.error('For example: {ext:"html", fn: require("consolidate").swig}');
			sails.log.error('For details: http://expressjs.com/api.html#app.engine');
			throw new Error('Invalid view engine configuration.');
		}

		// Try to load view module if a function wasn't specified directly
		if ( !config.views.engine.fn ) {
			var engineModule, 
				dependencyPath = sails.config.appPath + '/node_modules/' + config.views.engine.ext,
				fn;
			try {
				engineModule = require(dependencyPath);
				fn = engineModule.__express;

				if ( !util.isFunction(fn) ) {
					throw new Error('Invalid view engine-- are you sure it supports `consolidate`?');
				}
			}
			catch (e) {
				sails.log.error('Your configured server-side view engine (' + config.views.engine.ext + ') could not be found.');
				sails.log.error('Usually, this just means you need to install a dependency.');
				sails.log.error('To install ' + config.views.engine.ext + ', run:  `npm install ' + config.views.engine.ext + ' --save`');
				sails.log.error('Otherwise, please change your `engine` configuration in config/views.js.');
				throw e;
			}

			// Save reference to view rendering function
			sails.config.views.engine.fn = fn;
		}


		// Let user know that a leading . is not required in the viewEngine option and then fix it
		if (config.views.engine.ext[0] === '.') {
			log.warn('A leading `.` is not required in the views.engine option.  Removing it for you...');
			config.views.engine.ext = config.views.engine.ext.substr(1);
		}

		// Custom layout location
		// (if string specified, it's used as the relative path from the views folder)
		// (if not string, but truthy, relative path from views folder defaults to ./layout.*)
		// (if falsy, don't use layout)
		if ( !util.isString(config.views.layout) && config.views.layout ) {
			config.views.layout = 'layout.' + config.views.engine.ext;
		}



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
			util.extend(sails.config.policies || {}, sails.config.policy);
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
        if (originalUserConfig.ssl) {
            config.express = config.express || {};
            config.express.serverOptions = config.express.serverOptions || {};
            if (originalUserConfig.express && originalUserConfig.express.serverOptions && (originalUserConfig.express.serverOptions.cert || originalUserConfig.express.serverOptions.key)) {
                log.warn('You specified the ssl option, but there are also ssl options specified in express.serverOptions.'+
                         'The global ssl options will be used for the websocket server, but the serverOptions values will be used for the express HTTP server.');
                util.merge(config.express.serverOptions, config.ssl);
            } else {
                util.extend(config.express.serverOptions, config.ssl);
            }
        }

		// Return marshalled session object
		/////////////////////////////////////////////
		return config;
	};

};
