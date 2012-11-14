////////////////////////////////////////////////////////////
// Sails
// common.js
////////////////////////////////////////////////////////////
// Define global app state object
sails = {};

// Define global configuration object
config = sails.config = {};

// Global Dependencies
express = require('express');
ejs = require('ejs');
fs = require('fs');
path = require('path');
async = require('async');
Sequelize = require("sequelize");
_ = require('underscore');
Email = require("email").Email;
debug = require('./logger.js').debug;

// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

// // All functions, including conflicts, will be available through _.str object
_.str.include('Underscore.string', 'string');

// Dependencies
var acl = require("./acl"),
	util = require('./util'),
	rigging = require('rigging');

// _u shortcut for legacy support
_u = util;

// Load and initialize the app
exports.lift = function liftSails(userConfig) {
	exports.load(userConfig, function() {
		exports.initialize(userConfig);
	});
};

// Extend defaults with user config
// exports.configure = function (config) {
// 	sails.config = _.extend(sails.config || {}, config || {});
	
// 	config.session = _.extend({
// 		secret: "k3yboard_" + Math.random() + "_kat" + Math.random(),
// 		store: new express.session.MemoryStore(),
// 		key: "sails.sid"
// 	}, config.session || {});
// };

// Load the dependencies and app-specific components
exports.load = function loadSails(userConfig, cb) {

	validateUserConfig(userConfig);
	sails.config = _.extend({}, config, userConfig);

	// Smart defaults for session
	config.session = _.extend({
		secret: "k3yboard_" + Math.random() + "_kat" + Math.random(),
		store: new express.session.MemoryStore(),
		key: "sails.sid"
	}, config.session || {});

	// Load routes config globally
	urlMappings = _.extend({}, fs.existsSync(config.appPath + '/routes.js') ? require(config.appPath + '/routes') : {});

	// EXPERIMENTAL connect v2 support
	// see https://github.com/senchalabs/connect/issues/588
	//var connect = require('connect');
	//var connectCookie = require('cookie');
	//var cookieSecret = "k3yboard_kat";
	//parseCookie = function(cookie) {
	//	return connect.utils.parseSignedCookies(connectCookie.parse(decodeURIComponent(cookie)),cookieSecret);
	//}
	var connect = require('connect');
	parseCookie = connect.utils.parseCookie;
	ConnectSession = connect.middleware.session.Session;

	// Port to run the server on
	config.port = userConfig.port || 1337;

	// Self-awareness: the host the server *thinks it is*
	config.host = userConfig.host || "localhost";

	// Name of application
	config.appName = userConfig.appName || "SailsJS";

	// Environment to run this app in
	// One of: ["development", "production"]
	config.environment = userConfig.environment || "development";

	// Determine static path (defaults to /public)
	// A directory of statically accesible files
	config.staticPath = config.staticPath || config.appPath + "/public";

	// Rigging configuration (automatic asset compilation)
	if (config.rigging) {
		if (!_.isObject(config.rigging)) throw new Error ("Invalid rigging configuration object!");

		// Determine destination path for compiled assets (defaults to /.compiled)
		config.rigging.outputPath = config.rigging.outputPath || config.appPath + "/.compiled";

		// Determine rigging compilation sequence 
		// (defaults to /public/dependencies , then /public/ui)
		config.rigging.sequence = config.rigging.sequence || [config.staticPath+"/dependencies" + config.staticPath+"/ui"];

		console.log("CONFIGURATION FOR RIGGING PULLD IN");
	}

	// HTTP cache configuration
	if (config.cache) {
		if (!_.isObject(config.cache)) throw new Error ("Invalid cache configuration object!");
		// (always disabled in development mode)
		if (config.environment === "development") {
			console.warn("NOTE: Cache configuration is set, but the app is running development mode so the cache wil not be used.");
		}

		// maxAge determines how long to keep cached assets
		config.cache.maxAge = config.cache.maxAge || 31557600000;
	}

	// Override the environment variable so express mirrors the sails env:
	process.env['NODE_ENV'] = config.environment;

	// Import ORM library
	db = require(__dirname + '/orm.js').db;

	// Sync again to absorb any new tables created due to N->N associations
	db.sync(function() {
		afterModelInitialization();

		// Perform callback
		cb && cb();
	});
};



// After database is initialized
function afterModelInitialization() {
	// Run boostrap script
	db.bootstrap();

	// Start HTTP server
	// (To use HTTPS, just include a key and cert in serverOptions i.e.
	// serverOptions = {
	//	key: fs.readFileSync('ssl/private.key.pem'),
	//	cert: fs.readFileSync('ssl/combined.crt')
	// };
	var serverOptions;

	// Legacy server options directive
	if(!_.isUndefined(config.serverOptions)) {
		serverOptions = config.serverOptions;
	}

	// New SSL options
	if(!_.isUndefined(config.ssl)) {
		if(!config.ssl || !config.ssl.cert || !config.ssl.key) {
			throw new Error("Invalid SSL config object!  Must include cert and key!");
		}
		serverOptions = _.extend(serverOptions, config.ssl);
	}

	// Create server
	// (# of args is counted, so we need a separate call)
	app = serverOptions ? express.createServer(serverOptions) : express.createServer();



	// Make express server available as an export
	module.exports = app;

	// Configuration
	// Enable JSONP
	app.enable("jsonp callback");

	app.configure(function() {
		// View path can be overridden in config
		app.set('views', config.viewPath || (config.appPath + '/views'));

		// View engine can be overridden in config
		app.set('view engine', config.viewEngine || 'ejs');

		// Layout is on by default, in the top level of the view directory
		if(config.layout === false) {
			app.set('view options', {
				layout: false
			});
		} else if(_.isString(config.layout)) {
			app.set('view options', {
				layout: config.layout
			});
		}

		// Bodyparser is always on
		app.use(express.bodyParser());

		// If this is development mode, 
		if(config.environment === 'development') {
			// Allow access to static dirs
			app.use(express['static'](config.staticPath));

			// Allow access to compiled and uncompiled rigging directories
			app.use('/rigging_static',express['static'](config.rigging.outputPath));
			_.each(config.rigging.sequence,function (item) {
				// Validate that this is a directory
				var isDir = false;
				try { 
					if (fs.statSync(item).isDirectory()) {
						app.use('/rigging_static',express['static'](item));
					}
				} catch (e) {
					console.warn("Files not allowed in rigging.sequence in development mode-- only directories.");
					process.exit(1);
				}
			});

			// Set up error handling
			app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));
		} else if(config.environment === 'production') {
			var oneYear = config.cache.maxAge;
			app.use(express['static'](config.staticPath, {
				maxAge: oneYear
			}));
			app.use('/rigging_production',express['static'](config.rigging.outputPath, {
				maxAge: oneYear
			}));

			// ignore errors
			app.use(express.errorHandler());
		}

		// Hook up session / cookie support
		app.use(express.cookieParser());
		app.use(express.session(config.session));

		// Add annoying Sails header instead of annoying Express header
		app.use(function(req, res, next) {
			res.header("X-Powered-By", 'Sails <sailsjs.com>)');
			next();
		});

		// Allow usage of custom express middleware
		if(_.isFunction(config.customMiddleware)) {
			config.customMiddleware(app);
		}

		// Allow full REST simulation for clients which don't support it natively
		// (by using _method parameter)
		app.use(express.methodOverride());

		// Set up express router
		app.use(app.router);
	});

	// By convention, serve .json files using the ejs engine
	app.register('.json', ejs);


	// Automatically grab and instantiate services from directory
	// CASE SENSITIVE :: USES FILENAME (i.e. ApiService)
	_.each(require('require-all')({
		dirname: config.appPath + '/services',
		filter: /(.+)\.js$/
	}), function(service, filename) {
		var serviceName = filename;
		global[serviceName] = service;
	});
}


// Get socket interpreter
var socketInterpreter = require("./interpreter");

// Initialize the app (start the servers)
exports.initialize = function initSails(userConfig) {

	validateUserConfig(userConfig);
	sails.config = _.extend(userConfig, config);

	// Listen for websocket connections (and rejects) through socket.io
	io = require('socket.io').listen(app);

	// Set up controllers
	sails.controllers = require("./controllers");

	// Load policies
	sails.policies = require("./policies").policies;
	sails.acl = require("./policies").acl;


	// Map Routes
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	var router = require('./router');

	// Link Express HTTP requests to a function which handles them
	router.listen(function(url, fn, httpVerb) {
		// Use all,get,post,put,or delete conditionally based on http verb
		// null === *any* of the HTTP verbs
		if(!httpVerb) {
			app.all(url, fn);
		} else {
			_.isFunction(app[httpVerb]) && app[httpVerb](url, fn);
		}
	});

	// Link Socket.io requests to a controller/action
	// When a socket.io client connects, listen for the actions in the routing table
	io.sockets.on('connection', function(socket) {
		debug.debug("New socket.io client connected!", socket.id);

		// Prune data from the session to avoid sharing anything inadvertently
		// By default, very restrictive
		var pruneFn = config.sessionPruneFn ||
		function(session) {
			return {};
		};

		// Respond w/ information about session
		socket.emit('sessionUpdated', pruneFn(socket.handshake.session));

		// Map routes
		socket.on('message', function(socketReq, fn) {
			socketInterpreter.route(socketReq, fn, socket);
		});
	});

	// Compile Mast components, if Rigging is in place
	console.log("Initializing rigging middleware...");
	rigging.compile(config.rigging.sequence, {
		environment: config.environment,
		outputPath: config.rigging.outputPath
	}, startServers);

	// Add beforeShutdown event
	if(_.isFunction(config.beforeShutdown)) {
		process.on('SIGINT', function() {
			process.exit();
		});
		process.on('SIGTERM', function() {
			process.exit();
		});
		process.on('exit', function() {
			config.beforeShutdown();
		});
	}

	// start the ws(s):// and http(s):// servers
	function startServers() {

		// Start http(s):// server
		app.listen(config.port);
		if(!app.address()) {
			debug.warn('Error detecting app.address().');
			debug.warn('*************', 'Usually this means you have another instance of Sails, or something else, running on this port.', '*************');
		} else {

			console.log("Sails server running on port %d in %s mode.", app.address().port, app.settings.env);
		}

		// Configure auth for ws(s):// server
		io.set('authorization', function(data, accept) {
			// Attach authorization middleware to socket event receiver
			if(data.headers.cookie) {
				data.cookie = parseCookie(data.headers.cookie);

				data.sessionID = data.cookie[config.session.key];
				data.sessionStore = config.session.store;

				// (literally) get the session data from the session store
				config.session.store.get(data.sessionID, function(err, session) {
					if(err || !session) {
						// if we cannot grab a session, turn down the connection
						accept('Cannot load session from socket.io! (perhaps session id is invalid?)\n' + err, false);
					} else {
						// save the session data and accept the connection
						// create a session object, passing data as request and our
						// just acquired session data
						data.session = new ConnectSession(data, session);
						accept(null, true);
					}
				});
			} else {
				return accept('No cookie transmitted with socket.io connection.', false);
			}
		});
	}
};


// Validate the userConfig parameter
function validateUserConfig(userConfig) {
	if(!userConfig) {
		throw new Error("No configuration specified!");
	} else if(!userConfig.appPath) {
		throw new Error("No appPath specified!");
	} else if(!userConfig.datasource) {
		throw new Error("No datasource specified!");
	} else if(userConfig.session) {
		if(!_.isObject(userConfig.session)) {
			throw new Error("Invalid session store configuration!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		} else if(!userConfig.session.secret) {
			throw new Error("Cannot use a custom session store without specifying a secret!\n" + "Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		}
	}
}