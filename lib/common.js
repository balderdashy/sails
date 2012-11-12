////////////////////////////////////////////////////////////
// Sails
// common.js
////////////////////////////////////////////////////////////
// Define global app state object
sails = {};

// Define global configuration object
config = {};

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
	util = require('./util');

// _u shortcut for legacy support
_u = util;

// Load and initialize the app
exports.lift = function liftSails(userConfig) {
	exports.load(userConfig, function() {
		exports.initialize(userConfig);
	});
};

// Validate the userConfig parameter

function validateUserConfig(userConfig) {
	if(!userConfig) {
		throw new Error("No configuration specified!");
	} else if(!userConfig.appPath) {
		throw new Error("No appPath specified!");
	} else if(!userConfig.datasource) {
		throw new Error("No datasource specified!");
	}
	else if (userConfig.session) {
		if (!_.isObject(userConfig.session)) {
			throw new Error ("Invalid session store configuration!\n" +
					"Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		}
		else if (!userConfig.session.secret) {
			throw new Error ("Cannot use a custom session store without specifying a secret!\n" +
					"Should be of the form: { store: someStore, secret: 'someVerySecureString' }");
		}
	}
}

// Load the dependencies and app-specific components
exports.load = function loadSails(userConfig, cb) {

	validateUserConfig(userConfig);
	config = _.extend({}, config, userConfig);

	// Smart defaults for session
	config.session = _.extend({
		secret: "k3yboard_" + Math.random() + "_kat" + Math.random(),
		store: new express.session.MemoryStore(),
		key: "sails.sid"
	}, config.session || {});

	// Load routes config globally
	urlMappings = _.extend({}, fs.existsSync(config.appPath + '/routes.js') ? require(config.appPath + '/routes') : {});

	// Determine whether Rigging library is in place
	// to detect whether integrated Mast support should be enabled
	try {
		console.log("Loading rigging lib...");
		config.rigging = require('rigging');
		console.log("Rigging loaded successfully!");
	} catch(e) {
		config.rigging = false;
		if(e.code === 'MODULE_NOT_FOUND') {
			console.log("Rigging could not be found.");
		} else {
			console.log("Error occured:", e);
		}
	}


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


	// ////////////////////////////////////////////////////////////
	// // DB configuration
	// ////////////////////////////////////////////////////////////
	// db = {
	// 	model: null,
	// 	sync: function(callback) {
	// 		var opt = (config.datasource.dbCreate == "create") ? {
	// 			force: true
	// 		} : undefined;
	// 		sequelize.sync(opt).success(function() {
	// 			console.log("ORM sync successful!");
	// 			callback && callback();
	// 		});
	// 	},
	// 	// Use custom bootstrap function if specified in config, otherwise do nothing
	// 	bootstrap: _.isFunction(config.bootstrap) ? config.bootstrap : function() {},
	// 	initialize: function() {
	// 		// Connect to database
	// 		sequelize = db.model = new Sequelize(
	// 		config.datasource.database, config.datasource.username, config.datasource.password, {
	// 			logging: config.datasource.logging || false,
	// 			host: config.datasource.host || 'localhost',
	// 			port: config.datasource.port || 3306,
	// 			dialect: config.datasource.dialect || 'mysql',
	// 			storage: config.datasource.storage || ':memory:',
	// 			pool: config.datasource.pool || undefined
	// 		});
	// 	}
	// };

	////////////////////////////////////////////////////////////
	// App/Misc configuration
	////////////////////////////////////////////////////////////
	// Port to run the server on
	config.port = userConfig.port || 1337;

	// Self-awareness: the host the server *thinks it is*
	config.host = userConfig.host || "localhost";

	// Name of application
	config.appName = userConfig.appName || "SailsJS";

	// Environment to run this app in
	// One of: ["development", "production"]
	config.appEnvironment = userConfig.appEnvironment || "development";

	// Override the environment variable so express mirrors the sails env:
	process.env['NODE_ENV'] = config.appEnvironment;

	// Use Mast socket?
	config.mastSocket = (typeof mastSocket == 'undefined') ? true : mastSocket;


	// App-wide logic additions --------
	// Convenience variable for sequelize query chainer 
	//	QueryChainer = Sequelize.Utils.QueryChainer;
	// Import ORM library
	db = require(__dirname + '/orm.js').db;


	// Sync again to absorb any new tables created due to N->N associations
	db.sync(function() {
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
			serverOptions = _.extend(serverOptions,config.ssl);
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
			if (config.layout === false) {
				app.set('view options', {
					layout: false
				});
			}
			else if (_.isString(config.layout)) {
				app.set('view options', {
					layout: config.layout
				});
			}

			// Bodyparser is always on
			app.use(express.bodyParser());


			// If this is development mode, and Rigging is in place 
			// allow direct browser access to Mast
			if ( config.appEnvironment === 'development' ) {
				app.use(express['static'](config.appPath + '/public'));
				app.use(express['static'](config.appPath + '/mast'));
				app.use(express['static'](config.rigging.libPath()));

				// Set up error handling
				app.use(express.errorHandler({
					dumpExceptions: true,
					showStack: true
				}));
			}
			else if ( config.appEnvironment === 'production' ) {
				var oneYear = 31557600000;
				app.use(express['static'](config.appPath + '/public', { maxAge: oneYear }));

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

			// Allow for full REST simulation for clients which don't support it natively (by using _method parameter)
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


		// Perform callback
		cb && cb();
	});
};

// Get socket interpreter
var socketInterpreter = require("./interpreter");

// Initialize the app (start the servers)
exports.initialize = function initSails(userConfig) {

	validateUserConfig(userConfig);
	config = _.extend(userConfig, config);

	// Listen for websocket connections (and rejects) through socket.io
	io = require('socket.io').listen(app);

	// Set up controllers
	sails.controllers = require("./controllers");

	// Load policies
	sails.policies = require("./policies").policies;
	sails.acl = require("./policies").acl;


	// Map Routes
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	var router = require(__dirname + '/router');

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
	if(config.rigging) {
		console.log("Initializing rigging...");
		config.rigging.compiler(config, startServers);
	} else {
		startServers();
	}

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