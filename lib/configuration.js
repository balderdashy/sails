// Extend defaults with user config
exports.build = function (defaults,userConfig) {

	var result = {};
	// For each property in user config, override all arrays and non-objects in defaults
	_.each(userConfig,function (val,key) {
		if (!_.isObject(defaults[key]) || _.isArray(defaults[key])) result[key] = val;
	});
	
	// If a property exists in defaults, but not in user config, include it
	_.defaults(result,userConfig,defaults);

	// Then extend each of the config subobjects
	result.rigging	= _.extend(defaults.rigging,userConfig.rigging);
	result.session	= _.extend(defaults.session,userConfig.session);
	result.cache	= _.extend(defaults.cache,userConfig.cache);
	result.express	= _.extend(defaults.express,userConfig.express);
	result.log		= _.extend(defaults.log,userConfig.log);

	return result;
};

// Sails default configuration
exports.defaults = function (userConfig) {
	// Set up config defaults
	return {

		// Port to run this app on
		port: 1337,

		// Self-awareness: the host the server *thinks it is*
		host: 'localhost',

		// Name of application for layout title
		appName: 'Sails',

		// Environment to run this app in; one of: ["development", "production"]
		environment: 'development',

		// Path for views
		viewPath: userConfig.appPath + '/views',

		// Engine for views (can be ejs, haml, etc.)
		viewEngine: 'ejs',

		// Layout is on by default, in the top level of the view directory
		// true === use default
		// false === don't use a layout
		// string === path to layout
		layout: true,

		// Directory where static files will be served from
		// (static files are things like stylesheets, scripts, favicon, etc.)
		staticPath: userConfig.appPath + '/public',

		// Rigging configuration (automatic asset compilation)
		rigging: {
			outputPath	: userConfig.appPath + '/public',
			sequence	: [userConfig.appPath + '/public/dependencies', userConfig.appPath + '/public/ui']
		},

		// HTTP cache configuration
		cache: {
			maxAge: 31557600000
		},

		// Session store configuration
		session: {
			secret: "k3yboard_" + Math.random() + "_kat" + Math.random(),
			store: new express.session.MemoryStore(),
			key: "sails.sid"
		},

		// Logging config
		log: {
			level: 'info'
		},

		// Custom options for express server
		express: {
			
			// Sails extras
			serverOptions: null,
			customMiddleware: null,

			// Built-in
			bodyParser: express.bodyParser(),
			cookieParser: express.cookieParser(),
			methodOverride: express.methodOverride()
		}

	};
};

// Normalize legacy and duplicative user config settings
// Validate any required properties, and throw errors if necessary.
// Then issue deprecation warnings and disambiguate any potentially confusing settings.
exports.validate = function (config, originalUserConfig) {
	
	// Required options
	/////////////////////////////////////////////
	if(!originalUserConfig) {
		throw new Error("No configuration specified!");
	} else if(!originalUserConfig.appPath) {
		throw new Error("No appPath specified in configuration!  Sails needs an appPath to know where your Sails project is located.");
	} else if(!config.datasource) {
		throw new Error("No mySQL datasource specified! (This restriction will be lifted in an upcoming release when the in-memory db is included w/ Sails)");
	}

	// Ensure that secret is specified if a custom session store is used
	if(originalUserConfig.session) {
		if(!_.isObject(originalUserConfig.session)) {
			throw new Error("Invalid session store configuration!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		} else if(!originalUserConfig.session.secret) {
			throw new Error("Cannot use a custom session store without specifying a secret!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		}
	}

	// If ssl config is specified, ensure all pieces are there
	if(!_.isUndefined(originalUserConfig.ssl)) {
		if(!config.ssl || !config.ssl.cert || !config.ssl.key) {
			throw new Error("Invalid SSL config object!  Must include cert and key!");
		}
	}

	// View engines != ejs are not currently supported
	if (config.viewEngine !== "ejs") {
		throw new Error ("Sorry, only the ejs view engine is supported at this time.  You specified: "+config.viewEngine);
	}

	// Deprecation warnings
	/////////////////////////////////////////////

	// Upgrade to the new express config object
	if (originalUserConfig.serverOptions) {
		sails.log.warn("serverOptions has been deprecated in favor of the new express configuration option."+
				"\nPlease replace serverOptions={foo:'bar'} with express.serverOptions={foo:'bar'}.");
		config.express.serverOptions = config.serverOptions;
	}
	if (originalUserConfig.customMiddleware) {
		sails.log.warn("customMiddleware has been deprecated in favor of the new express configuration option."+
				"\nPlease replace customMiddleware=foo with express.customMiddleware=foo.");
		config.express.customMiddleware = config.customMiddleware;
	}



	// Disambiguations
	/////////////////////////////////////////////
	// Issue warning if cache settings are specified, but this is development mode (cache is always off in development mode)
	if (config.environment === "development" && originalUserConfig.cache) {
		sails.log.warn("NOTE: Even though a cache configuration is specified, cache is always off when your app is in development mode.");
	}

	// Express serverOptions override ssl, but just for the http server
	if (originalUserConfig.ssl && 
		(config.express.serverOptions.cert || config.express.serverOptions.cert)) {
		sails.log.warn("You specified the ssl option, but there are also ssl options specified in express.serverOptions."+
					"The global ssl options will be used for the websocket server, but the serverOptions values will be used for the express HTTP server.");
		config = _.recursive.defaults(config.express.serverOptions,config.ssl);
	}

	// Let user know that a leading . is not required in the viewEngine option and then fix it
	if (config.viewEngine[0] === ".") {
		sails.log.warn("A leading '.' is not required in the viewEngine option.  Removing it for you...");
		config.viewEngine = config.viewEngine.substr(1);
	}


	// Return marshalled session object
	/////////////////////////////////////////////
	return config;
};