// Sails default configuration
exports.defaults = function (config) {
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
		viewPath: config.appPath + '/views',

		// Engine for views (can be ejs, haml, etc.)
		viewEngine: 'ejs',

		// Layout is on by default, in the top level of the view directory
		// true === use default
		// false === don't use a layout
		// string === path to layout
		layout: true,

		// Directory where static files will be served from
		// (static files are things like stylesheets, scripts, favicon, etc.)
		staticPath: config.appPath + '/public',

		// Rigging configuration (automatic asset compilation)
		rigging: {
			outputPath	: config.appPath + '/public',
			sequence	: [config.appPath + '/public/dependencies', config.appPath + '/public/ui']
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

		// Custom options for express server
		express: {
			serverOptions: null,
			customMiddleware: null,
			bodyParser: express.bodyParser(),
			cookieParser: express.cookieParser(),
			methodOverride: express.methodOverride()
		}

	};
};

// Normalize legacy and duplicative user config settings
// Validate any required properties, and throw errors if necessary.
// Then issue deprecation warnings and disambiguate any potentially confusing settings.
exports.validate = function (config) {
	
	// Required options
	/////////////////////////////////////////////
	if(!config) {
		throw new Error("No configuration specified!");
	} else if(!config.appPath) {
		throw new Error("No appPath specified!");
	} else if(!config.datasource) {
		throw new Error("No datasource specified!");
	}

	// Ensure that secret is specified if a custom session store is used
	if(config.session) {
		if(!_.isObject(config.session)) {
			throw new Error("Invalid session store configuration!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		} else if(!config.session.secret) {
			throw new Error("Cannot use a custom session store without specifying a secret!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		}
	}

	// If ssl config is specified, ensure all pieces are there
	if(!_.isUndefined(config.ssl)) {
		if(!config.ssl || !config.ssl.cert || !config.ssl.key) {
			throw new Error("Invalid SSL config object!  Must include cert and key!");
		}
	}

	// View engines != ejs are not currently supported
	if (config.viewEngine !== "ejs") {
		throw new Error ("Sorry, only the ejs view engine is supported at this time.");
	}

	// Deprecation warnings
	/////////////////////////////////////////////

	// Upgrade to the new express config object
	if (config.serverOptions) {
		console.warn("serverOptions has been deprecated in favor of the new express configuration option."+
				"\nPlease replace serverOptions={foo:'bar'} with express.serverOptions={foo:'bar'}.");
		config.express.serverOptions = config.serverOptions;
	}
	if (config.customMiddleware) {
		console.warn("customMiddleware has been deprecated in favor of the new express configuration option."+
				"\nPlease replace customMiddleware=foo with express.customMiddleware=foo.");
		config.express.customMiddleware = config.customMiddleware;
	}



	// Disambiguations
	/////////////////////////////////////////////
	// Issue warning if cache settings are specified, but this is development mode (cache is always off in development mode)
	if (config.environment === "development") {
		console.warn("NOTE: Even though a cache configuration is specified, cache is always off when your app is in development mode.");
	}

	// Express serverOptions override ssl, but just for the http server
	if (config.ssl && 
		(config.express.serverOptions.cert || config.express.serverOptions.cert)) {
		console.warn("You specified the ssl option, but there are also ssl options specified in express.serverOptions."+
					"The global ssl options will be used for the websocket server, but the serverOptions values will be used for the express HTTP server.");
		config = _.recursive.defaults(config.express.serverOptions,config.ssl);
	}

	// Let user know that a leading . is not required in the viewEngine option and then fix it
	if (config.viewEngine[0] === ".") {
		console.warn("A leading '.' is not required in the viewEngine option.  Removing it for you...");
		config.viewEngine = config.viewEngine.substr(1);
	}


	// Return marshalled session object
	/////////////////////////////////////////////
	return config;
};