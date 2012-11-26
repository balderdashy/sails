////////////////////////////////////////////////////////////
// Sails
// common.js
////////////////////////////////////////////////////////////

// Define global app state and configuration object
sails = {
	config	: {}
};

// Initialize logger (stores sails.log internally)
require('./logger');

// TODO: Deprecate global access to everything
// (use sails.* instead)
config = sails.config;

// External dependencies
var rigging = require('rigging');
express = require('express');
ejs = require('ejs');
fs = require('fs');
path = require('path');
async = require('async');
Sequelize = require("sequelize");
_ = require('underscore');
Email = require("email").Email;
//debug = require('./logger.js').debug;
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');
_u = util; // shortcut for legacy

// Internal dependencies
var acl = require("./acl"),
	util = require('./util'),
	configuration = require("./configuration");

// Load and initialize the app
exports.lift = function liftSails(userConfig) {
	exports.load(userConfig, function() {
		exports.initialize(userConfig);
	});
};

// Load the dependencies and app-specific components
exports.load = function loadSails(userConfig, cb) {

	// Validate and merge user config with defaults
	sails.config = _.recursive.extend(configuration.defaults(userConfig), userConfig || {});
	userConfig = configuration.validate(sails.config,userConfig);

	// Load routes config globally
	urlMappings = _.extend({}, fs.existsSync(sails.config.appPath + '/routes.js') ? require(sails.config.appPath + '/routes') : {});


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

	// Override the environment variable so express mirrors the sails env:
	process.env['NODE_ENV'] = sails.config.environment;

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
	// Run database boostrap script
	db.bootstrap();


	// Start express HTTP server (and make it available as an export)
	if (sails.config.express.serverOptions) {
		module.exports = app = express.createServer(sails.config.express.serverOptions);
	}
	else {
		module.exports = app = express.createServer();
	}

	// Configure express server
	app.enable("jsonp callback");
	app.configure(function() {
		app.set('views', sails.config.viewPath);
		app.set('view engine', sails.config.viewEngine);
		app.set('view options', {
			layout: sails.config.layout
		});

		if (sails.config.express.bodyParser) {
			app.use(sails.config.express.bodyParser);
		}

		// If this is development mode, 
		if(sails.config.environment === 'development') {
			// Allow access to static dirs
			app.use(express['static'](sails.config.staticPath));

			// Allow access to compiled and uncompiled rigging directories
			app.use('/rigging_static',express['static'](sails.config.rigging.outputPath));
			_.each(sails.config.rigging.sequence,function (item) {
				// Validate that this is a directory
				var isDir = false;
				try { 
					if (fs.statSync(item).isDirectory()) {
						app.use('/rigging_static',express['static'](item));
					}
				} catch (e) {
					sails.log.warn("Files not allowed in rigging.sequence in development mode-- only directories.");
					process.exit(1);
				}
			});

			// Set up error handling
			app.use(express.errorHandler({
				dumpExceptions: true,
				showStack: true
			}));

		} else if(sails.config.environment === 'production') {
			var oneYear = sails.config.cache.maxAge;
			app.use(express['static'](sails.config.staticPath, {
				maxAge: oneYear
			}));
			app.use('/rigging_production',express['static'](sails.config.rigging.outputPath, {
				maxAge: oneYear
			}));

			// ignore errors
			app.use(express.errorHandler());
		}

		if (sails.config.express.cookieParser) {
			app.use(sails.config.express.cookieParser);
		}

		// Connect session to express
		app.use(express.session(sails.config.session));

		// Add annoying Sails header instead of annoying Express header
		app.use(function(req, res, next) {
			res.header("X-Powered-By", 'Sails <sailsjs.com>)');
			next();
		});

		// Allow usage of custom express middleware
		if (sails.config.express.customMiddleware) {
			sails.config.express.customMiddleware(app);
		}

		// Allow full REST simulation for clients which don't support it natively
		// (by using _method parameter)
		if (sails.config.express.methodOverride) {
			app.use(sails.config.express.methodOverride);
		}

		// Set up express router
		app.use(app.router);
	});

	// By convention, serve .json files using the ejs engine
	app.register('.json', ejs);

	// Automatically grab and instantiate services from directory
	// CASE SENSITIVE :: USES FILENAME (i.e. ApiService)
	_.each(require('require-all')({
		dirname: sails.config.appPath + '/services',
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
		sails.log.debug("New socket.io client connected!", socket.id);

		// Cookie is socket.handshake.headers.cookie
		// Maybe do something w/ it later (send it back)
		// Trade-off: expose non-HTTP-only cookie to avoid making one initial http request?

		// Prune data from the session to avoid sharing anything inadvertently
		// By default, very restrictive
		var pruneFn = sails.config.sessionPruneFn ||
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
	sails.log.info("Initializing rigging middleware...");
	rigging.compile(sails.config.rigging.sequence, {
		environment: sails.config.environment,
		outputPath: sails.config.rigging.outputPath
	}, function (err) {
		if (err) throw err;
		startServers();
	});

	// Add beforeShutdown event
	if(_.isFunction(sails.config.beforeShutdown)) {
		process.on('SIGINT', function() {
			process.exit();
		});
		process.on('SIGTERM', function() {
			process.exit();
		});
		process.on('exit', function() {
			sails.config.beforeShutdown();
		});
	}

	// start the ws(s):// and http(s):// servers
	function startServers() {

		// Start http(s):// server
		app.listen(sails.config.port);
		if(!app.address()) {
			sails.log.warn('Error detecting app.address().');
			sails.log.warn('*************', 'Usually this means you have another instance of Sails, or something else, running on this port.', '*************');
		} else {

			sails.log.info("Sails server running on port " + app.address().port + ' in '+ app.settings.env + ' mode');
		}

		// Configure auth for ws(s):// server
		io.set('authorization', function(handshake, next) {

			// Attach authorization middleware to socket event receiver
			if(handshake.headers.cookie) {
				handshake.cookie = parseCookie(handshake.headers.cookie);

				handshake.sessionID = handshake.cookie[sails.config.session.key];
				handshake.sessionStore = sails.config.session.store;

				// (literally) get the session handshake from the session store
				sails.config.session.store.get(handshake.sessionID, function(err, session) {
					if(err || !session) {

						// TODO: Cookie is invalid, so regenerate a new one


						// if we cannot grab a session, turn down the connection
						next('Cannot load session from socket.io! (perhaps session id is invalid?)\n' + err, false);
					} 

					// Save the session handshake and accept the connection
					else {
						// Create a session object, passing our just-acquired session handshake
						handshake.session = new ConnectSession(handshake, session);
						next(null, true);
					}
				});
			} else {
				return next('No cookie transmitted with socket.io connection.', false);
			}
		});
	}
};
