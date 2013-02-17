var _ = require('underscore');

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
	result.assets	= _.extend(defaults.assets,userConfig.assets);
	result.session	= _.extend(defaults.session,userConfig.session);
	result.cache	= _.extend(defaults.cache,userConfig.cache);
	result.express	= _.extend(defaults.express,userConfig.express);
	result.log		= _.extend(defaults.log,userConfig.log);
	result.globals	= _.extend(defaults.globals,userConfig.globals);
	result.paths	= _.extend(defaults.paths,userConfig.paths);
	result.modelDefaults = _.extend(defaults.modelDefaults,userConfig.modelDefaults);

	return result;
};

// Sails default configuration
exports.defaults = function (userConfig) {

	// If appPath not specified, use process.cwd() to get the app dir
	userConfig.appPath = userConfig.appPath || process.cwd();
	
	// Paths for application modules and key files
	var paths = {
		api				: userConfig.appPath + '/api',
		ui				: userConfig.appPath + '/ui',
		config			: userConfig.appPath + '/config',
		tmp				: userConfig.appPath + '/.tmp'
	};

	_.extend(paths, {

		controllers		: paths.api + '/controllers',
		models			: paths.api + '/models',
		services		: paths.api + '/services',
		policies		: paths.api + '/policies',
		adapters		: paths.api + '/adapters',

		'public'		: paths.ui + '/public',
		dependencies	: paths.ui + '/dependencies',
		views			: paths.ui + '/views',
		templates		: paths.ui + '/views/templates',
		layout			: paths.ui + '/views/layout.ejs',

		routesFile		: paths.config + '/routes.js',
		policiesFile	: paths.config + '/policies.js'

	});

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

		// Paths for application modules and key files
		paths: paths,

		// Engine for views (can be ejs, haml, etc.)
		viewEngine: 'ejs',

		// Layout is on by default, in the top level of the view directory
		// true === use default
		// false === don't use a layout
		// string === path to layout
		layout: true,

		// Default model properties
		modelDefaults: {
			adapter: 'memory'
		},

		// assets configuration (automatic asset compilation)
		assets: {
			sequence	: [paths.dependencies, paths['public'], paths.templates]
		},

		// HTTP cache configuration
		cache: {
			maxAge: 31557600000
		},

		// Session store configuration
		session: {
			secret: "k3yboard_" + Math.random() + "_kat" + Math.random(),
			store: new (require('express').session.MemoryStore)(),
			key: "sails.sid"
		},

		// Logging config
		log: {
			level: 'info'
		},

		// Variables which will be made globally accessible
		globals: {
			_: true,
			async: true,
			sails: true,
			services: true,
			adapters: true,
			models: true
		},

		// Custom options for express server
		express: {
			
			// Sails extras
			serverOptions: null,
			customMiddleware: null,

			// Built-in
			bodyParser: require('express').bodyParser(),
			cookieParser: require('express').cookieParser(),
			methodOverride: require('express').methodOverride()
		}

	};
};

// Normalize legacy and duplicative user config settings
// Validate any required properties, and throw errors if necessary.
// Then issue deprecation warnings and disambiguate any potentially confusing settings.
exports.validate = function (config, originalUserConfig) {
	var log = (typeof sails !== 'undefined' && sails.log) || console;

	if(!originalUserConfig) {
		throw new Error("No configuration specified!");
	} 

	// Convenience shorthand
	/////////////////////////////////////////////
	if (adapterShorthand[config.modelDefaults.adapter]) {
		// If any config is specified in the shorthand, but not in the user definition, use it
		_.defaults(config.modelDefaults, adapterShorthand[config.modelDefaults.adapter]);

		// Replace actual adapter string name regardless
		config.modelDefaults.adapter = adapterShorthand[config.modelDefaults.adapter].adapter;
	}

	
	// Required options
	/////////////////////////////////////////////

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

	// Ignore invalid items in assets sequence
	_.each(config.assets.sequence, function(item,index) {
		try {
			var inode = require('fs').statSync(item);

			// Validate that this is a directory
			if(!inode.isDirectory()) {
				log.warn("Ignoring: "+item+" (files are not allowed in assets.sequence in development mode-- only directories.)  Please check your configuration.");
				config.assets.sequence.splice(index,1);
			}

		} catch(e) {
			log.warn("Ignoring: "+item+" (listed in assets.sequence but does not exist.)  Please check your configuration.");
			config.assets.sequence.splice(index,1);
		}
	});

	// Deprecation warnings
	/////////////////////////////////////////////

	// Upgrade to the new express config object
	if (originalUserConfig.serverOptions) {
		log.warn("serverOptions has been deprecated in favor of the new express configuration option.");
		log.warn("Please replace serverOptions={foo:'bar'} with express.serverOptions={foo:'bar'}.");
		config.express.serverOptions = config.serverOptions;
	}
	if (originalUserConfig.customMiddleware) {
		log.warn("customMiddleware has been deprecated in favor of the new express configuration option.");
		log.warn("Please replace customMiddleware=foo with express.customMiddleware=foo.");
		config.express.customMiddleware = config.customMiddleware;
	}


	// Legacy support
	/////////////////////////////////////////////

	// Support old rigging config
	if (originalUserConfig.rigging) {
		log.warn("'rigging' has been deprecated in favor of the 'assets' configuration option.");
		log.warn("Please replace rigging = {foo:'bar'} with assets = {foo:'bar'}.");
		config.assets = config.rigging;
	}

	// Check that policies path exists-- if it doesn't, try middleware
	var policiesPathExists = require('fs').existsSync(config.paths.policies);
	if (!policiesPathExists) {

		// If middleware DOES exist, issue a deprecation warning
		var inferredMiddlewarePath = config.paths.api + '/middleware';
		var middlewarePathExists = require('fs').existsSync(inferredMiddlewarePath);
		if (middlewarePathExists) {
			log.warn("The 'middleware' directory has been deprecated in favor of 'policies'."+
				"\nPlease rename your 'middleware' directory to 'policies'.");
			config.paths.policies = inferredMiddlewarePath;
		}

		// Otherwise, we're fine, there's no policies OR middleware-- no ambiguity.
	}

	// Check that policies config is labeled appropriately (not policy)
	if (sails.config.policy) {
		log.warn("The 'policy.js' file is now 'policies.js'.");
		_.extend(sails.config.policies || {}, sails.config.policy);
	}

	// Disambiguations
	/////////////////////////////////////////////
	// Issue warning if cache settings are specified, but this is development mode (cache is always off in development mode)
	if (config.environment === "development" && originalUserConfig.cache) {
		log.warn("NOTE: Even though a cache configuration is specified, cache is always off when your app is in development mode.");
	}

	// Express serverOptions override ssl, but just for the http server
	if (originalUserConfig.ssl && 
		(config.express.serverOptions.cert || config.express.serverOptions.cert)) {
		log.warn("You specified the ssl option, but there are also ssl options specified in express.serverOptions."+
					"The global ssl options will be used for the websocket server, but the serverOptions values will be used for the express HTTP server.");
		config = _.recursive.defaults(config.express.serverOptions,config.ssl);
	}

	// Let user know that a leading . is not required in the viewEngine option and then fix it
	if (config.viewEngine[0] === ".") {
		log.warn("A leading '.' is not required in the viewEngine option.  Removing it for you...");
		config.viewEngine = config.viewEngine.substr(1);
	}


	// Return marshalled session object
	/////////////////////////////////////////////
	return config;
};


// Adapter shorthand definitions
var adapterShorthand = {

	// An in-memory data store (dev-only)
	memory	: {
		adapter: 'waterline-dirty',
		inMemory: true
	},

	// A persistent data store on the local disk (dev-only)
	disk	: {
		adapter: 'waterline-dirty',
		inMemory: false
	},

	// MySQL data store
	mysql	: {
		adapter: 'waterline-mysql'
	},

	// MongoDB data store
	mongo	: {
		adapter: 'TODO'
	},

	// Redis data store
	redis	: {
		adapter: 'TODO'
	},

	// Neo4j data store
	neo4j	: {
		adapter: 'TODO'
	},

	// Cassandra data store
	cassandra	: {
		adapter: 'TODO'
	},

	// PostgreSQL datastore
	postgres	: {
		adapter: 'TODO'
	},

	// Oracle datastore
	oracle		: {
		adapter: 'TODO'
	},

	// DB2 data store
	db2			: {
		adapter: 'TODO'
	},

	// Microsoft SQL Server data store
	mssql	: {
		adapter: 'TODO'
	}
};