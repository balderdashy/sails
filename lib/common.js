////////////////////////////////////////////////////////////
// Sails
// common.js
////////////////////////////////////////////////////////////
// Define app and configuration object
var sails = {
	config: {}
};

// Utility libs
var _ = require('underscore');
_.str = require('underscore.string');
var async = require('async');

// TODO: Remove all globals, EXCEPT: 
//		- _
//		- async
//		- sails
//		- models
//		- services
global['_'] = _;
global['async'] = async;
global['sails'] = sails;

// Node.js dependencies
var fs = require('fs');
var path = require('path');

// Routing and HTTP server
var express = require('express');

// WebSocket server (+polyfill support)
var socketio = require('socket.io');

// Templating
var ejs = require('ejs');

// Sails ecosystem dependencies
var rigging = require('rigging');
var waterline = require('waterline');

// Internal dependencies
var policy = require("./policy");
var util = require('./util');
var configuration = require("./configuration");

// Reference to internal Express server
var internalExpressServer;




// TODO: allow global access to even those objects to be disabled in config



/**
 * Load and initialize the app
 */
exports.lift = function liftSails(userConfig, cb) {
	exports.load(userConfig, function() {
		exports.initialize(userConfig, cb);
	});
};
exports.hoist = exports.lift;
exports.start = exports.lift;



/**
 * Kill the http and socket.io servers
 */
exports.lower = function lowerSails(cb) {
	internalExpressServer.close();

	// This is probably unnecessary (seems to be killing it when express server is killed)
	// io.server.close();
};
exports.stop = exports.lower;
exports.close = exports.lower;
exports.kill = exports.lower;



/**
 * Load the dependencies and app-specific components
 */
exports.load = function loadSails(userConfig, cb) {

	// Merge user config with defaults
	sails.config = configuration.build(configuration.defaults(userConfig), userConfig);

	// Initialize captains logger
	sails.log = require('./logger')(sails.config.log);

	// Pass logger down to submodules
	rigging = rigging({log: sails.log});
	// TODO: pass logger to waterline

	// Validate user config
	userConfig = configuration.validate(sails.config, userConfig);

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

	// Load app's models and custom adapters
	// Case-insensitive, using filename to determine identity
	// (default waterline adapters are included automatically)
	sails.models = require('./buildDictionary.js')(sails.config.appPath + '/models', /(.+)\.js$/);
	sails.adapters = require('./buildDictionary.js')(sails.config.appPath + '/adapters', /(.+Adapter)\.js$/, /Adapter/);

	// Augment models with room/socket logic
	var roomLogic = require('./rooms');
	_.each(sails.models,function (model) {
		_.extend(model,roomLogic);
	});

	// TODO: Put this in waterline
	//////////////////////////////////////////////////////////////////////
	// Ensure that an adapter is set for each model, otherwise default to dirty
	_.each(sails.models,function (model) {
		if (!model.adapter) model.adapter = 'dirty';
	});
	//////////////////////////////////////////////////////////////////////

	// Start up waterline (ORM)
	waterline(sails.adapters,sails.models, function (){
		afterModelInitialization();
		cb && cb();
	});
};



// After database is initialized


function afterModelInitialization() {
	// TODO:
	// Run database boostrap script
	// db.bootstrap();


	// Start express HTTP server (and make it available as an export)
	if(sails.config.express.serverOptions) {
		module.exports = app = express.createServer(sails.config.express.serverOptions);
	} else {
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

		if(sails.config.express.bodyParser) {
			app.use(sails.config.express.bodyParser);
		}

		if(sails.config.environment === 'development') {
			// Allow access to static dirs
			app.use(express['static'](sails.config.staticPath));

			// Allow access to compiled and uncompiled rigging directories
			app.use('/rigging_static', express['static'](sails.config.rigging.outputPath));
			_.each(sails.config.rigging.sequence, function(item) {
				// Validate that this is a directory
				var isDir = false;
				try {
					if(fs.statSync(item).isDirectory()) {
						app.use('/rigging_static', express['static'](item));
					}
				} catch(e) {
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
			app.use('/rigging_production', express['static'](sails.config.rigging.outputPath, {
				maxAge: oneYear
			}));

			// ignore errors
			app.use(express.errorHandler());
		}

		if(sails.config.express.cookieParser) {
			app.use(sails.config.express.cookieParser);
		}

		// Connect session to express
		app.use(express.session(sails.config.session));

		// Add annoying Sails header instead of annoying Express header
		app.use(function(req, res, next) {
			res.header("X-Powered-By", 'Sails <sailsjs.org>)');
			next();
		});

		// Allow usage of custom express middleware
		if(sails.config.express.customMiddleware) {
			sails.config.express.customMiddleware(app);
		}

		// Allow full REST simulation for clients which don't support it natively
		// (by using _method parameter)
		if(sails.config.express.methodOverride) {
			app.use(sails.config.express.methodOverride);
		}

		// Set up express router
		app.use(app.router);
	});

	// By convention, serve .json files using the ejs engine
	app.register('.json', ejs);
}


// Get socket interpreter
var socketInterpreter = require("./interpreter");

// Initialize the app (start the servers)
exports.initialize = function initSails(userConfig, cb) {


	// Listen for websocket connections (and rejects) through socket.io
	var io = socketio.listen(app);

	// Configure socket.io
	function commonSocketIOConfig() {
		io.set('log level', 0);
	}
	io.configure('development', function() {
		commonSocketIOConfig();
	});
	io.configure('production', function() {
		commonSocketIOConfig();
	});

	// Load app modules (case-insensitive)
	sails.controllers = require('./buildDictionary.js')(sails.config.appPath + '/controllers', /(.+)\.js$/, /Controller/);
	sails.services = require('./buildDictionary.js')(sails.config.appPath + '/services', /(.+)\.js$/, /Service/);
	sails.middleware = require('./buildDictionary.js')(sails.config.appPath + '/middleware', /(.+)\.js$/);

	// Load app policy tree
	sails.policy = require("./policy");

	// Load route config
	sails.routes = require('./routes');

	// Map Routes
	// Link Express HTTP requests to a function which handles them
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	require('./router').listen(function(url, fn, httpVerb) {
		// Use all,get,post,put,or delete conditionally based on http verb
		// null === *any* of the HTTP verbs
		_.shout("outcome:",url,!!fn,httpVerb);
		if(!httpVerb) {
			app.all(url, fn);
		} else {
			_.isFunction(app[httpVerb]) && app[httpVerb](url, fn);
		}
	});

	// Link Socket.io requests to a controller/action
	// When a socket.io client connects, listen for the actions in the routing table
	io.sockets.on('connection', function(socket) {
		sails.log.verbose("New socket.io client connected!", socket.id);

		// Cookie is socket.handshake.headers.cookie
		// Maybe do something w/ it later
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
	sails.log.verbose("Initializing rigging middleware...");
	rigging.compile(sails.config.rigging.sequence, {
		environment: sails.config.environment,
		outputPath: sails.config.rigging.outputPath
	}, function(err) {
		if(err) {
			sails.log.error("Unable to compile assets.");
			sails.log.error(err);
			startServers();
		} else startServers();
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
		internalExpressServer = app.listen(sails.config.port);
		if(!app.address()) {
			sails.log.warn('Error detecting app.address().');
			sails.log.warn('Usually this means you have another instance of Sails, or something else, running on this port.');
		} else {

			sails.log.info("Sails lifted on port " + app.address().port + ' in ' + app.settings.env + ' mode');
		}

		// Configure auth for ws(s):// server
		io.set('authorization', function(data, accept) {
			// If a cookie was provided in the query string, use it.
			if (data.query.cookie) {
				data.headers.cookie = data.query.cookie;
			}

			// Attach authorization middleware to socket event receiver
			if(data.headers.cookie) {
				// TODO: Support for Express 3.x, see:
				// https://gist.github.com/3337459
				// https://groups.google.com/forum/?fromgroups=#!topic/socket_io/pMuHFFZRfpQ
				
				// Solution found here in connect source code:
				// https://github.com/senchalabs/connect/blob/master/lib/middleware/session.js

				data.cookie = parseCookie(data.headers.cookie);

				data.sessionID = data.cookie[sails.config.session.key];
				data.sessionStore = sails.config.session.store;

				// (literally) get the session handshake from the session store
				sails.config.session.store.get(data.sessionID, function(err, session) {
					// An error occurred, so refuse the connection
					if(err) {
						accept('Error loading session from socket.io! \n' + err, false);
					}
					// Cookie is invalid, so regenerate a new one
					else if(!session) {
						data.session = new ConnectSession(data, {
							cookie: {
								// Prevent access from client-side javascript
								httpOnly: true
							}
						});
						sails.log.verbose("Generated new session....", data);
						accept(null, true);
					}

					// Save the session handshake and accept the connection
					else {
						// Create a session object, passing our just-acquired session handshake
						data.session = new ConnectSession(data, session);
						sails.log.verbose("Connected to existing session....");
						accept(null, true);
					}
				});
			} else {
				return accept('No cookie transmitted with socket.io connection.', false);
			}
		});

		// Trigger sails.initialize() callback if specified
		cb && cb(null, sails);
	}
};


// Export sails object
exports.sails = sails;