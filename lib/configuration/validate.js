module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('../util'),
		fs		= require('fs');



	/** 
	 * Make sure existsSync does not crash on older versions of Node
	 */

	fs.existsSync = fs.existsSync || require('path').existsSync;


	/**
	 * Normalize legacy and duplicative user config settings
	 * Validate any required properties, and throw errors if necessary.
	 * Then issue deprecation warnings and disambiguate any potentially confusing settings.
	 *
	 * @param {} configSoFar
	 * @param {} originalUserConfig
	 */ 
	return function validateConfiguration (configSoFar, originalUserConfig) {

		// TODO: deprecate this
		// Provide `mock` escape route for unit tests and CLI tool
		// (just returns the configSoFar)
		if (originalUserConfig.mock) {
			return configSoFar;
		}

		// Use sails log if defined, otherwise use console
		var log = (typeof sails !== 'undefined' && sails.log) || console;




		//////////////////////////////////////////////////////////////////////////////////////////
		// Backwards compat. for `config.adapters`
		//////////////////////////////////////////////////////////////////////////////////////////

		// `config.adapters` will soon become `config.connections`
		if (configSoFar.adapters) {

			// `config.adapters.default` is being replaced with `config.model.connections`
			if (configSoFar.adapters['default']) {
				sails.log.verbose('Deprecation warning :: Replacing `config.adapters.default` with `config.model.connections`....');
				configSoFar.model.connections = configSoFar.adapters['default'];
			}
			
			// Merge `config.adapters` into `config.connections`
			sails.log.verbose('Deprecation warning :: Replacing `config.adapters` with `config.connections`....');
			util.each(configSoFar.adapters, function (legacyAdapterConfig, connectionName) {
				// Ignore `default`
				if (connectionName === 'default') {
					return;
				}

				// Normalize `module` to `adapter`
				var connection = util.clone(legacyAdapterConfig);
				connection.adapter = connection.module;
				delete connection.module;
				sails.log.verbose(
					'Deprecation warning :: ' +
					'Replacing `config.adapters['+connectionName+'].module` ' + 
					'with `config.connections['+connectionName+'].adapter`....');
				configSoFar.connections[connectionName] = connection;
			});
			delete configSoFar.adapters;
		}

		
		// Required options
		/////////////////////////////////////////////

		// If ssl config is specified, ensure all pieces are there
		if(!util.isUndefined(originalUserConfig.ssl)) {
			if(!configSoFar.ssl || !configSoFar.ssl.cert || !configSoFar.ssl.key) {
				throw new Error('Invalid SSL config object!  Must include cert and key!');
			}
		}

		// onConnect must be valid function
		if (configSoFar.sockets.onConnect && typeof configSoFar.sockets.onConnect !== 'function') {
			throw new Error('Invalid `config.sockets.onConnect`!  Must be a function.');
		}




		// Disambiguations
		/////////////////////////////////////////////

		// If host is explicitly specified, set sails.explicitHost
		// (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
		if (originalUserConfig.host) {
			sails.explicitHost = originalUserConfig.host;
		}

		// Issue warning if cache settings are specified, but this is development mode (cache is always off in development mode)
		if (configSoFar.environment === 'development' && originalUserConfig.cache) {
			log.warn('NOTE: Even though a cache configuration is specified, cache is always off when your app is in development mode.');
		}

		// Express serverOptions override ssl, but just for the http server
        if (originalUserConfig.ssl) {
            configSoFar.express = configSoFar.express || {};
            configSoFar.express.serverOptions = configSoFar.express.serverOptions || {};
            if (originalUserConfig.express && originalUserConfig.express.serverOptions && (originalUserConfig.express.serverOptions.cert || originalUserConfig.express.serverOptions.key)) {
                log.warn('You specified the ssl option, but there are also ssl options specified in express.serverOptions.'+
                         'The global ssl options will be used for the websocket server, but the serverOptions values will be used for the express HTTP server.');
                util.merge(configSoFar.express.serverOptions, configSoFar.ssl);
            } else {
                util.extend(configSoFar.express.serverOptions, configSoFar.ssl);
            }
        }

		// Return marshalled session object
		/////////////////////////////////////////////
		return configSoFar;
	};

};
