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

// TODO: remove this
//////////////////////////////
global['_'] = _;
global['sails'] = sails;
global['async'] = async;
//////////////////////////////

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
var modules = require('sails-moduleloader');
var util = require('sails-util');

// Internal dependencies
// var util = require('./util');
var configuration = require("./configuration");
var pubsub = require('./rooms');





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
 * Load the dependencies and app-specific components
 */
exports.load = function loadSails(userConfig, cb) {

	// Merge user config with defaults
	sails.config = configuration.build(configuration.defaults(userConfig), userConfig);

	// Initialize captains logger
	sails.log = require('./logger')(sails.config.log);

	// Pass logger down to submodules
	rigging = rigging({log: sails.log});
	

	// Validate user config
	sails.config = configuration.validate(sails.config, userConfig);

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
	sails.models = modules.optional({
		dirname		: sails.config.appPath + '/models',
		filter		: /(.+)\.js$/
	});
	sails.adapters = modules.optional({
		dirname		: sails.config.appPath + '/adapters', 
		filter		: /(.+Adapter)\.js$/,
		replaceExpr	: /Adapter/
	});
	
	// Augment models with room/socket logic (& bind context)
	for (var identity in sails.models) {
		sails.models[identity] = _.extend(sails.models[identity],pubsub);
		_.bindAll(sails.models[identity], 'subscribe', 'introduce', 'unsubscribe', 'publish', 'room');
	}

	// Start up waterline (ORM) and pass in adapters, models, and logger	
	waterline({
		adapters: sails.adapters,
		collections: sails.models,
		log: sails.log
	}, function afterWaterlineInstantiated (err, instantiatedModules){
		if (err) throw new Error(err);

		// Make instantiated adapters and collections globally accessible
		sails.adapters = instantiatedModules.adapters;
		sails.models = sails.collections = instantiatedModules.collections;
		
		// Run boostrap script
		if (sails.config.bootstrap) sails.config.bootstrap(afterBootstrap);
		else afterBootstrap();

		function afterBootstrap () {
			require('./express.js').configure();
			cb && cb();
		}
	});
};


// Get socket interpreter
var socketInterpreter = require("./interpreter");

// Initialize the app (start the servers)
exports.initialize = function initSails(userConfig, cb) {


	// Listen for websocket connections (and rejects) through socket.io
	var io = sails.io = socketio.listen(sails.express.app);

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

	// Load app's logic modules (case-insensitive)
	sails.controllers = modules.optional({
		dirname		: sails.config.appPath + '/controllers',
		filter		: /(.+)Controller\.js$/, 
		replaceExpr	: /Controller/
	});
	sails.services = modules.optional({
		dirname		: sails.config.appPath + '/services',
		filter		: /(.+)\.js$/, 
		replaceExpr	: /Service/
	});
	sails.middleware = modules.optional({
		dirname		: sails.config.appPath + '/middleware',
		filter		: /(.+)\.js$/, 
		replaceExpr	: null
	});

	// Get federated controllers where actions are specified each in their own file
	var federatedControllers = modules.optional({
		dirname			: sails.config.appPath + '/controllers',
		pathFilter		: /(.+)\/(.+)\.js$/
	});
	sails.controllers = _.extend(sails.controllers,federatedControllers);


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
		if(!httpVerb) {
			sails.express.app.all(url, fn);
		} else {
			_.isFunction(sails.express.app[httpVerb]) && sails.express.app[httpVerb](url, fn);
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
		var pruneFn = sails.config.sessionPruneFn || function(session) {
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

	// Provide global access (if allowed in config)
	// TODO: support disablement of _, sails, and async globalization
	// if (sails.config.globals._) global['_'] = _;
	// if (sails.config.globals.async) global['async'] = async;
	// if (sails.config.globals.sails) global['sails'] = sails;
	// TODO: support models and adapter globalization (pass config into waterline)
	if (sails.config.globals.services) {
		_.each(sails.services,function (service,identity) {
			var globalName = _.str.capitalize(identity)+'Service';
			global[globalName] = service;
		});
	}

	// start the ws(s):// and http(s):// servers
	function startServers() {

		// Start http(s):// server
		sails.express.server = sails.express.app.listen(sails.config.port);
		if(!sails.express.app.address()) {
			sails.log.warn('Error detecting sails.express.app.address().');
			sails.log.warn('Usually this means you have another instance of Sails, or something else, running on this port.');
		} else {
			sails.log.info('Sails lifted on port ' + sails.express.app.address().port + 
							' in ' + sails.express.app.settings.env + ' mode');
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

/**
 * Kill the http and socket.io servers
 */
exports.lower = function lowerSails(cb) {
	sails.express.server.close();

	// This is probably unnecessary (seems to be killing it when express server is killed)
	// io.server.close();
};
exports.stop = exports.lower;
exports.close = exports.lower;
exports.kill = exports.lower;


// Export sails object
exports.sails = sails;