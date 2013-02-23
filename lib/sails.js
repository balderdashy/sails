// sails.js
// --------------------
//
// Entry point for Sails core

// Define app and configuration object
var sails = {
	config: {}
};

// Utility libs
var _ = require('underscore');
_.str = require('underscore.string');
var async = require('async');

// TODO: make this disableable
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

// Socket.io server (WebSockets+polyfill to support Flash sockets, AJAX long polling, etc.)
var socketio = require('socket.io');

// Templating
var ejs = require('ejs');

// Sails ecosystem defaults
sails.waterline = require('./waterline/waterline.js');
sails.modules = require('./loader.js');
sails.util = require('./util.js');
sails.log = require('./logger')();


// Internal dependencies
var configuration = require("./configuration");
var pubsub = require('./pubsub');



/**
 * Load and initialize the app
 */
function liftSails(userConfig, cb) {
	loadSails(userConfig, function(err) {
		if (err) {
			sails.log.error("Could not load Sails server.");
			throw new Error(err);
		}
		initSails(cb);
	});
}


/**
 * Load the dependencies and app-specific components
 */
function loadSails(configOverride, cb) {
	// If appPath not specified, use process.cwd() to get the app dir
	var userConfig = {};
	userConfig.appPath = userConfig.appPath || process.cwd();

	// Get config files (must be in /config)
	userConfig = _.extend(userConfig,sails.modules.aggregate({
		dirname		: userConfig.appPath + '/config',
		exclude		: ['locales', 'local.js'],
		filter		: /(.+)\.js$/,
		identity	: false
	}));

	// Extend with local and (TODO) environment-specific config
	userConfig = _.extend(userConfig,sails.modules.aggregate({
		dirname		: userConfig.appPath + '/config',
		filter		: /local\.js$/,
		identity	: false
	}));

	// Extend with override
	userConfig = _.extend(userConfig,configOverride || {});

	// Merge user config with defaults
	sails.config = _.extend(sails.config,configuration.build(configuration.defaults(userConfig), userConfig));

	// Initialize captains logger
	sails.log = require('./logger')(sails.config.log);

	// Pass logger down to submodules

	// For reference
	// var someOtherModulePath = require('path').dirname(require.resolve('someOtherModule')) + '/../package.json';
	
	// Validate user config
	sails.config = configuration.validate(sails.config, userConfig);

	// Indicate that server is starting
	sails.log("Starting server in " + sails.config.appPath + "...");


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

	// Load app's models
	// Case-insensitive, using filename to determine identity
	sails.models = sails.modules.optional({
		dirname		: sails.config.paths.models,
		filter		: /(.+)\.js$/
	});

	// Augment models with room/socket logic (& bind context)
	for (var identity in sails.models) {
		sails.models[identity] = _.extend(sails.models[identity],pubsub);
		_.bindAll(sails.models[identity], 'subscribe', 'introduce', 'unsubscribe', 'publish', 'room');
	}

	// Load custom adapters
	// Case-insensitive, using filename to determine identity
	sails.adapters = sails.modules.optional({
		dirname		: sails.config.paths.adapters,
		filter		: /(.+Adapter)\.js$/,
		replaceExpr	: /Adapter/
	});

	// Include default adapters automatically
	// (right now, just waterline-dirty)
	_.extend(sails.adapters, {
		'waterline-dirty': require('waterline-dirty')
	});


	// Start up waterline (ORM) and pass in adapters and models
	// as well as the sails logger and a copy of the default adapter configuration
	sails.waterline({
		
		// Let waterline know about our app path
		appPath: userConfig.appPath,

		adapters: sails.adapters,
		
		collections: sails.models,
		
		log: sails.log,

		collection: _.clone(sails.config.modelDefaults) || { adapter: 'waterline-dirty' }

	}, function afterWaterlineInstantiated (err, instantiatedModules){
		if (err) throw new Error(err);

		// Make instantiated adapters and collections globally accessible
		sails.adapters = instantiatedModules.adapters;
		sails.models = sails.collections = instantiatedModules.collections;

		// Load app's service modules (case-insensitive)
		sails.services = sails.modules.optional({
			dirname		: sails.config.paths.services,
			filter		: /(.+)\.js$/,
			caseSensitive: true
		});
		// Provide global access (if allowed in config)
		// TODO: support disablement of _, sails, and async globalization
		// if (sails.config.globals._) global['_'] = _;
		// if (sails.config.globals.async) global['async'] = async;
		// if (sails.config.globals.sails) global['sails'] = sails;
		if (sails.config.globals.services) {
			_.each(sails.services,function (service,identity) {
				var globalName = service.globalId || service.identity;
				global[globalName] = service;
			});
		}

		// Load app controllers
		sails.controllers = sails.modules.optional({
			dirname		: sails.config.paths.controllers,
			filter		: /(.+)Controller\.js$/, 
			replaceExpr	: /Controller/
		});

		// Get federated controllers where actions are specified each in their own file
		var federatedControllers = sails.modules.optional({
			dirname			: sails.config.paths.controllers,
			pathFilter		: /(.+)\/(.+)\.js$/
		});
		sails.controllers = _.extend(sails.controllers,federatedControllers);


		// Load policy modules
		sails.policies = sails.modules.optional({
			dirname		: sails.config.paths.policies,
			filter		: /(.+)\.js$/, 
			replaceExpr	: null
		});

		
		// Run boostrap script
		if (sails.config.bootstrap) sails.config.bootstrap(afterBootstrap);
		else afterBootstrap();

		function afterBootstrap (err) {
			if (err) return cb && cb(err);
			require('./express.js').configure(function (err) {
				if (err) return cb && cb(err);

				// Everything went well, trigger cb if one was specified
				else return cb && cb();
			});
		}
	});
}


// Get socket interpreter
var socketInterpreter = require("./interpreter");

// Initialize the app (start the servers)
function initSails(cb) {

	// Extend w/ data from Sails package.json
	var packageConfig = require('./package.js');
	sails.version = packageConfig.version;
	sails.dependencies = packageConfig.dependencies;

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

	// logic modules USED TO BE HERE!!!


	// Load app policy tree
	sails.config.policies = _.extend({ "*" : true },sails.config.policies);

	// Load route config
	sails.routes = _.extend({},sails.config.routes);

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

	// Fire up app servers
    startServers();

	// Add beforeShutdown event
	var exiting;
	process.on('SIGINT', function() {
		beforeShutdown();
	});
	process.on('SIGTERM', function() {
		beforeShutdown();
	});
	process.on('exit', function() {
		if (!exiting) beforeShutdown();
	});
	function beforeShutdown() {
		exiting = true;
		if(_.isFunction(sails.config.beforeShutdown)) {
			sails.config.beforeShutdown();
		}
	}

	// start the ws(s):// and http(s):// servers
	function startServers() {

		// Start http(s):// server
		sails.express.server = sails.express.app.listen(sails.config.port);
		if(!sails.express.app.address()) {
			// '\nBut there was an error detecting sails.express.app.address().' +
			sails.log.error('Trying to start server on port ' + sails.config.port + '...');
			sails.log.error('But something else is already running on that port!');
			sails.log.error('Please disable the other server, or choose a different port, and try again.');
		} else {
			sails.log();
			sails.log.ship();
			sails.log('Sails lifted on port ' + sails.config.port + ' in ' + sails.config.environment + ' mode.');
			
			if (sails.config.environment === 'development') {
				sails.log();
				sails.log('( to see your app, visit: http://' + sails.config.host + ':' + sails.config.port + ' )');
			}
		}

		// Configure auth for ws(s):// server
		io.set('authorization', function(data, accept) {
			// If a cookie was provided in the query string, use it.
			if (data.query.cookie) {
				data.headers.cookie = data.query.cookie;
			}

			// Attach authorization policy to socket event receiver
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
}

/**
 * Kill the http and socket.io servers
 */
function lowerSails(cb) {
	sails.express.server.close();

	// This is probably unnecessary (seems to be killing it when express server is killed)
	// io.server.close();
}




// Stop the server
exports.lower = lowerSails;
exports.stop = exports.lower;
exports.close = exports.lower;
exports.kill = exports.lower;


// Start the server
exports.lift = liftSails;
exports.hoist = exports.lift;
exports.start = exports.lift;

// Direct access to load and initialize, for testing
exports.load = loadSails;
exports.initialize = initSails;

// Export access to instantiated sails object
exports.sails = sails;

// Export logger and utils
exports.log = sails.log;
