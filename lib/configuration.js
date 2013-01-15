var _ = require('underscore');

var log = (typeof sails !== 'undefined' && sails.log) || console;

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
	result.globals	= _.extend(defaults.globals,userConfig.globals);
	result.paths	= _.extend(defaults.paths,userConfig.paths);

	return result;
};

// Sails default configuration
exports.defaults = function (userConfig) {

	// If appPath not specified, use process.cwd() to get the app dir
	userConfig.appPath = userConfig.appPath || process.cwd();
	
	// Paths for application modules and key files
	var paths = {
		controllers		: userConfig.appPath + '/api/controllers',
		models			: userConfig.appPath + '/api/models',
		services		: userConfig.appPath + '/api/services',
		middleware		: userConfig.appPath + '/api/middleware',
		adapters		: userConfig.appPath + '/api/adapters',

		'public'		: userConfig.appPath + '/ui/public',
		dependencies	: userConfig.appPath + '/ui/dependencies',
		views			: userConfig.appPath + '/ui/views',
		templates		: userConfig.appPath + '/ui/views/templates',
		layout			: userConfig.appPath + '/ui/views/layout.ejs',

		config			: userConfig.appPath + '/config',

		tmp				: userConfig.appPath + '/.tmp'
	};

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

		// Default data storage adapter config
		adapter: 'memory',

		// Rigging configuration (automatic asset compilation)
		rigging: {
			outputPath	: paths.tmp,
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
	if(!originalUserConfig) {
		throw new Error("No configuration specified!");
	} 

	// Convenience shorthand
	/////////////////////////////////////////////
	if (adapterShorthand[config.adapter]) {
		config.adapter = adapterShorthand[config.adapter];
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

	// Ignore invalid items in rigging sequence
	_.each(config.rigging.sequence, function(item,index) {
		try {
			var inode = require('fs').statSync(item);

			// Validate that this is a directory
			if(!inode.isDirectory()) {
				log.warn("Ignoring: "+item+" (files are not allowed in rigging.sequence in development mode-- only directories.)  Please check your configuration.");
				config.rigging.sequence.splice(index,1);
			}

		} catch(e) {
			log.warn("Ignoring: "+item+" (listed in rigging.sequence but does not exist.)  Please check your configuration.");
			config.rigging.sequence.splice(index,1);
		}
	});

	// Deprecation warnings
	/////////////////////////////////////////////

	// Upgrade to the new express config object
	if (originalUserConfig.serverOptions) {
		log.warn("serverOptions has been deprecated in favor of the new express configuration option."+
				"\nPlease replace serverOptions={foo:'bar'} with express.serverOptions={foo:'bar'}.");
		config.express.serverOptions = config.serverOptions;
	}
	if (originalUserConfig.customMiddleware) {
		log.warn("customMiddleware has been deprecated in favor of the new express configuration option."+
				"\nPlease replace customMiddleware=foo with express.customMiddleware=foo.");
		config.express.customMiddleware = config.customMiddleware;
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
		identity: 'waterline-dirty',
		inMemory: true
	},

	// A persistent data store on the local disk (dev-only)
	disk	: {
		identity: 'waterline-dirty',
		inMemory: false
	},

	// MySQL data store
	mysql	: {
		identity: 'waterline-mysql'
	},

	// MongoDB data store
	mongo	: {
		identity: 'TODO'
	},

	// Redis data store
	redis	: {
		identity: 'TODO'
	},

	// Neo4j data store
	neo4j	: {
		identity: 'TODO'
	},

	// Cassandra data store
	cassandra	: {
		identity: 'TODO'
	},

	// PostgreSQL datastore
	postgres	: {
		identity: 'TODO'
	},

	// Oracle datastore
	oracle		: {
		identity: 'TODO'
	},

	// DB2 data store
	db2			: {
		identity: 'TODO'
	},

	// Microsoft SQL Server data store
	microsoft	: {
		identity: 'TODO'
	}
};