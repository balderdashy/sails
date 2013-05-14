var _ = require('underscore');

// Sails default configuration
module.exports = function (userConfig) {

	// If appPath not specified, use process.cwd() to get the app dir
	userConfig.appPath = userConfig.appPath || process.cwd();
	
	// Paths for application modules and key files
	var paths = {
		app				: userConfig.appPath,
		config			: userConfig.appPath + '/config',
		tmp				: userConfig.appPath + '/.tmp'
	};

	_.extend(paths, {

		controllers		: paths.app + '/api/controllers',
		models			: paths.app + '/api/models',
		services		: paths.app + '/api/services',
		policies		: paths.app + '/api/policies',
		adapters		: paths.app + '/api/adapters',

		'public'		: paths.app + '/public',
		templates		: paths.app + '/assets/templates',
		dependencies	: paths.app + '/dependencies',
		views			: paths.app + '/views',
		layout			: paths.app + '/views/layout.ejs',

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
		adapters: {
			'default': 'disk',
			memory: {
				module: 'sails-dirty',
				inMemory: true
			},
			disk: {
				module: 'sails-dirty',
				filePath: './.tmp/dirty.db',
				inMemory: false
			},
			mongo: {
				module		: 'sails-mongo',
				host		: 'localhost',
				user		: 'root'
			},
			redis: {
				module		: 'sails-redis',
				host		: 'localhost',
				user		: 'root'
			},
			sqlite: {
				module		: 'sails-sqlite',
				host		: 'localhost',
				user		: 'root'
			},
			riak: {
				module		: 'sails-riak',
				host		: 'localhost',
				user		: 'root'
			},
			cassandra: {
				module		: 'sails-cassandra',
				host		: 'localhost',
				user		: 'root'
			},
			elasticsearch: {
				module		: 'sails-elasticsearch',
				host		: 'localhost',
				user		: 'root'
			},
			couchbase: {
				module		: 'sails-couchbase',
				host		: 'localhost',
				user		: 'root'
			},
			mysql: {
				module		: 'sails-mysql',
				host		: 'localhost',
				user		: 'root'
			},
			postgresql: {
				module		: 'sails-postgresql',
				host		: 'localhost',
				user		: 'root'
			},
			oracle: {
				module		: 'sails-oracle',
				host		: 'localhost',
				user		: 'root'
			},
			db2: {
				module		: 'sails-db2',
				host		: 'localhost',
				user		: 'root'
			}
		},

		// assets configuration (automatic asset compilation)
		assets: {
			outputPath	: paths.tmp,
			sequence	: []
		},

		// HTTP cache configuration
		cache: {
			maxAge: 31557600000
		},

		// Session store configuration
		session: {
			secret: "k3yboard_" + Math.random() + "_kat" + Math.random(),
            adapter: 'memory',
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
		},

		io: {
			
			// Null uses the defaults
			transports: null
		},

		ssl: {}

	};
};