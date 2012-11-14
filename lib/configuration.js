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
		}

	};
};

// Validate user config
exports.validate = function (config) {
	
	// Check for requireds
	if(!userConfig) {
		throw new Error("No configuration specified!");
	} else if(!userConfig.appPath) {
		throw new Error("No appPath specified!");
	} else if(!userConfig.datasource) {
		throw new Error("No datasource specified!");
	} 

	// Ensure that secret is specified if a custom session store is used
	if(userConfig.session) {
		if(!_.isObject(userConfig.session)) {
			throw new Error("Invalid session store configuration!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		} else if(!userConfig.session.secret) {
			throw new Error("Cannot use a custom session store without specifying a secret!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		}
	}

	// Issue warning if cache settings are specified, but this is development mode (cache is always off in development mode)
	if (config.environment === "development") {
		console.warn("NOTE: Even though a cache configuration is specified, cache is always off when your app is in development mode.");
	}
};