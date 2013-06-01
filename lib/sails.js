// sails.js
// --------------------
//
// Entry point for Sails core

// Define app and configuration object
var sails = {
	config: {}
};

// Utility libs
var _ = require('lodash');
_.str = require('underscore.string');
var async = require('async');

// Globalize Sails
global['sails'] = sails;

// Node.js dependencies
var fs = require('fs');
var path = require('path');

// Routing and HTTP server
var express = require('express');

// Socket.io server (WebSockets+polyfill to support Flash sockets, AJAX long polling, etc.)
var socketio = require('socket.io');

// Default logger
var CaptainsLogger = require('./util/logger');

// Templating
var ejs = require('ejs');
var jade = require('jade');

// Sails ecosystem defaults
sails.waterline = require('./waterline');
sails.modules = require('./loader');
sails.util = require('./util');
sails.log = CaptainsLogger();

// Get socket interpreter
var socketInterpreter = require("./router/interpreter");

// Get router
var Router = require('./router');

// Internal dependencies
var configuration = require("./configuration");
var pubsub = require('./pubsub');

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


/**
 * Load and initialize the app
 */
function liftSails(configOverride, cb) {
	loadSails(configOverride, function(err) {
		if (err) {
			sails.log.error("Could not load Sails server.");
			sails.log.error(err);
			throw new Error(err);
		}
		initSails(cb);
	});
}


/**
 * Load the dependencies and app-specific components
 */
function loadSails(configOverride, cb) {

	// Load various pieces of framework
	async.auto({

		config: function (cb) {

			// If appPath not specified, use process.cwd() to get the app dir
			var userConfig = {};
			userConfig.appPath = userConfig.appPath || process.cwd();

			// Get config files (must be in /config)
			userConfig = _.extend(userConfig,sails.modules.aggregate({
				dirname		: userConfig.appPath + '/config',
				exclude		: ['locales', 'local.js', 'local.coffee'],
				filter		: /(.+)\.(js|coffee)$/,
				identity	: false
			}));

			// TODOS: Get locales

			// TODO: Extend with environment-specific config

			// Extend with local config
			userConfig = configuration.build(userConfig, _.extend(userConfig,sails.modules.aggregate({
				dirname		: userConfig.appPath + '/config',
				filter		: /local\.(js|coffee)$/,
				identity	: false
			})));


			// Map command line options to configurations
			if (!configOverride) {}
			else if (configOverride.dev && configOverride.prod) {
				sails.log.error('You cannot specify both production AND development!');
				process.exit(1);
			} else if (configOverride.dev) {
				configOverride = {environment: 'development'};
			} else if (configOverride.prod) {
				configOverride = {environment: 'production'};
			}

			// Extend with override
			userConfig = _.extend(userConfig,configOverride || {});

			// Merge user config with defaults
			sails.config = _.extend(sails.config,configuration.build(configuration.defaults(userConfig), userConfig));

			// Validate user config
			sails.config = configuration.validate(sails.config, userConfig);
			cb();
		},


		logger: ['config', function (cb) {

			// Initialize captains logger
			sails.log = CaptainsLogger(sails.config.log);
			cb();
		}],


		nodeEnv: ['config', function (cb) {
			sails.log.verbose('Setting Node environment...');

			// Override the environment variable so express mirrors the sails env:
			process.env['NODE_ENV'] = sails.config.environment;
			cb();
		}],


		models: ['config', 'logger', function (cb) {
			sails.log.verbose('Loading app models...');

			// Load app's model definitions
			// Case-insensitive, using filename to determine identity
			sails.models = sails.modules.optional({
				dirname		: sails.config.paths.models,
				filter		: /(.+)\.(js|coffee)$/
			});
			cb();
		}],


		grunt: ['config', 'logger', function (cb) {
			sails.log.verbose('Loading app Gruntfile...');

			// Now initialize this project's Grunt tasks
			// and execute the environment-specific gruntfile
			sails.spawnGrunt = require('./automation')('default', cb);
		}],


		viewEngine: ['config', 'logger', function (cb) {
			sails.log.verbose('Loading app view engine...');
			/**
			 * Let's keep a copy of the templating engine in the config.
			 * We need this for handlebars in particular so we can register some helper functions.
			 * TODO: this will change in Express 3.x
			 */
			sails.config.viewEngineModule = require(sails.config.viewEngine);
			cb();
		}],


		pubsub: ['config', 'logger', 'models', function (cb) {
			sails.log.verbose('Building pub/sub logic...');

			// Augment models with room/socket logic (& bind context)
			for (var identity in sails.models) {
				sails.models[identity] = _.defaults(sails.models[identity],pubsub);
				_.bindAll(sails.models[identity], 'subscribe', 'introduce', 'unsubscribe', 'publish', 'room', 'publishCreate', 'publishUpdate', 'publishDestroy');
			}
			cb();
		}],


		adapters: ['config', 'logger', 'models', function (cb) {
			sails.log.verbose('Loading app adapters...');

			// Load custom adapters
			// Case-insensitive, using filename to determine identity
			sails.adapters = sails.modules.optional({
				dirname		: sails.config.paths.adapters,
				filter		: /(.+Adapter)\.(js|coffee)$/,
				replaceExpr	: /Adapter/
			});

			// Include default adapters automatically
			// (right now, that's just defaultAdapterName)
			sails.adapters[sails.defaultAdapterModule] = require(sails.defaultAdapterModule);

			cb();
		}],


		orm: ['config', 'models', 'adapters', 'pubsub', function (cb) {
			sails.log.verbose('Loading ORM...');

			// "Resolve" adapters
			// Merge Sails' concept with the actual realities of adapter definitions in npm
			_.each(sails.models, function (model,modelIdentity) {
				_.extend(model,_.clone(resolveAdapter(model.adapter)));
			});

			// Return {} if the adapter is resolved
			function resolveAdapter (adapter, key, depth) {
				if (!depth) depth = 0;
				if (depth > 5) return adapter;

				// Return default adapter if this one is unspecified
				if (!adapter) return resolveAdapter (sails.config.adapters['default'], 'default', depth+1);

				// Try to look up adapter name in registered adapters for this app
				else if (_.isString(adapter)) {
					var lookupAttempt = sails.config.adapters[adapter];
					if (lookupAttempt) {
						return resolveAdapter (lookupAttempt, adapter, depth+1);
					}
					// If it's not a match, go ahead and wrap it in an objcet and return-- this must be a module name
					else return {adapter: adapter};
				}

				// Config was specified as an object
				else if (_.isObject(adapter)) {

					// If 'module' is specified, use that in lieu of the convenience key
					if (adapter.module) adapter.adapter = adapter.module;

					// Otherwise, use the convenience key and hope it's right!
					else adapter.adapter = key;
					return adapter;
				}

				else throw new Error('Unexpected result:  Adapter definition could not be resolved.');
			}

			// Start up waterline (ORM) and pass in adapters and models
			// as well as the sails logger and a copy of the default adapter configuration
			sails.waterline({

				// Let waterline know about our app path
				appPath: sails.config.appPath,

				adapters: sails.adapters,

				collections: sails.models,

				log: sails.log,

				collection: {
					globalize: sails.config.globals.models
				}

			}, function (err, instantiatedModules) {
				if (err) return cb(err);

				// Make instantiated adapters and collections globally accessible
				sails.adapters = instantiatedModules.adapters;
				sails.models = sails.collections = instantiatedModules.collections;

				cb();
			});
		}],


		services: ['orm', function (cb) {
			sails.log.verbose('Loading app services...');

			// Load app's service modules (case-insensitive)
			sails.services = sails.modules.optional({
				dirname		: sails.config.paths.services,
				filter		: /(.+)\.(js|coffee)$/,
				caseSensitive: true
			});
			cb();
		}],


		globals: ['services', function (cb) {
			sails.log.verbose('Creating global variables...');

			// Provide global access (if allowed in config)
			if (sails.config.globals._) global['_'] = _;
			if (sails.config.globals.async) global['async'] = async;

			if (sails.config.globals.services) {
				_.each(sails.services,function (service,identity) {
					var globalName = service.globalId || service.identity;
					global[globalName] = service;
				});
			}

			cb();
		}],


		controllers: ['orm', function (cb) {
			sails.log.verbose('Loading app controllers...');

			// Load app controllers
			sails.controllers = sails.modules.optional({
				dirname		: sails.config.paths.controllers,
				filter		: /(.+)Controller\.(js|coffee)$/,
				replaceExpr	: /Controller/
			});

			// Get federated controllers where actions are specified each in their own file
			var federatedControllers = sails.modules.optional({
				dirname			: sails.config.paths.controllers,
				pathFilter		: /(.+)\/(.+)\.(js|coffee)$/
			});
			sails.controllers = _.extend(sails.controllers,federatedControllers);

			cb();
		}],


		policies: ['orm', function (cb) {
			sails.log.verbose('Loading app policies...');

			// Load policy modules
			sails.policies = sails.modules.optional({
				dirname		: sails.config.paths.policies,
				filter		: /(.+)\.(js|coffee)$/,
				replaceExpr	: null
			});
			cb();
		}],


		bootstrap: ['orm', 'globals', function (cb) {
			sails.log.verbose('Running app bootstrap...');

			// Run boostrap script if specified
			var boostrapWarningTimer;
			if (sails.config.bootstrap) {
				var boostrapDefaultTimeout = 2000;
				boostrapWarningTimer = setTimeout(function() {
					sails.log.warn("Bootstrap is taking unusually long to execute "+
						"its callback (" + boostrapDefaultTimeout + "ms).\n"+
						"Perhaps you forgot to call it?  The callback is the first argument of the function.");
				}, boostrapDefaultTimeout);
				sails.config.bootstrap(function (err) {
					boostrapWarningTimer && clearTimeout(boostrapWarningTimer);
					if (err) return cb(err);
					return cb();
				});
			}
			// Otherwise, don't
			else cb();
		}],


		configureExpress: ['bootstrap', function (cb) {
			sails.log.verbose('Configuring Express...');

			require('./configuration/express').configure(cb);
		}]

	}, function (err) {
		if (err) {
			sails.log.error('Error encountered while loading Sails!');
			sails.log.error(err);
			return cb(err);
		}
		sails.log.verbose('Sails loaded successfully.');
		cb();
	});
}


// Initialize the app (start the servers)
function initSails(cb) {

	// Indicate that server is starting
	sails.log("Starting server in " + sails.config.appPath + "...");

	// Extend w/ data from Sails package.json
	var packageConfig = require('./configuration/package');
	sails.version = packageConfig.version;
	sails.dependencies = packageConfig.dependencies;

	// Listen for websocket connections (and rejects) through socket.io
	// and attach Socket.io to the underlying express server
	var io = sails.io = socketio.listen(sails.express.app);

	// Configure socket.io
	function commonSocketIOConfig() {
		//these don't really match with socket.io levels
		var logLevels = {
			"error": 0,
			"warn": 1,
			"debug": 2,
			"info": 3
		};

		io.set('log level', logLevels[sails.config.log.level] || logLevels["info"]);
	}

    // Setup custom socket.io MQ (pubsub) store(s)
    if (sails.config.io.adapter == 'redis') {
        var redis = require('../node_modules/connect-redis/node_modules/redis');
        var host = sails.config.io.host || '127.0.0.1';
        var port = sails.config.io.port || 6379;
        io.set('store', new socketio.RedisStore({
            redisPub: redis.createClient(port, host, sails.config.io),
            redisSub: redis.createClient(port, host, sails.config.io),
            redisClient: redis.createClient(port, host, sails.config.io)
        }));
    }

	io.configure('development', function() {
		commonSocketIOConfig();
	});
	io.configure('production', function() {
		commonSocketIOConfig();
	});

	// Apply transports config if it was provided
	if (sails.config.io.transports) {
		io.set('transports', sails.config.io.transports);
	}

	// Load app policy tree
	sails.config.policies = _.extend({ "*" : true },sails.config.policies);

	// Load route config
	sails.routes = _.extend({},sails.config.routes);

	// Map Routes
	// Link Express HTTP requests to a function which handles them
	// *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
	Router.listen(function(url, fn, httpVerb) {
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
	// Authorization has already passed at this point!
	io.sockets.on('connection', function(socket) {
		sails.log.verbose("New socket.io client connected!", socket.id);


		///////////////////////////////////////////////////////////////////////////
		// TODO: This will be deprecated
		///////////////////////////////////////////////////////////////////////////
		// Prune data from the session to avoid sharing anything inadvertently
		// By default, very restrictive
		var pruneFn = sails.config.sessionPruneFn || function(session) {
			return {};
		};

		// Grab session AGAIN upon connection
		// Respond w/ information about session
		sails.config.session.store.get(socket.handshake.sessionID, function(err, session) {
			socket.emit('sessionUpdated', pruneFn(socket.handshake.session));
		});
		///////////////////////////////////////////////////////////////////////////

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
		// If host is explicitly declared, include it in express's listen() call
		var failureTimer;
		sails.express.server = sails.express.app.listen(sails.config.port, sails.explicitHost, function (err, x) {
			clearTimeout(failureTimer);
			sails.log();
			sails.log.ship();
			sails.log('Sails (v'+sails.version +')');
			sails.log('Sails lifted on port ' + sails.config.port + ' in ' + sails.config.environment + ' mode.');

			if (sails.config.environment === 'development') {
				var usingSSL = ( ( sails.config.serverOptions && sails.config.serverOptions.key && sails.config.serverOptions.cert ) ||
					( sails.config.express && sails.config.express.serverOptions && sails.config.express.serverOptions.key && sails.config.express.serverOptions.cert ));

				sails.log();
				sails.log('( to see your app, visit: ' + ( usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + ' )');
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

					// Maintain sessionID in socket so that the session can be queried before processing each incoming message
					data.cookie = parseCookie(data.headers.cookie);
					data.sessionID = data.cookie[sails.config.session.key];

					// TODO: make sessions disableable for high-scale scenarios with volatile messages, e.g. analytics

					// Get session
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
					return accept('No cookie transmitted with socket.io connection.  Are you trying to access a socket server on a 3rd party domain?  Try sending an HTTP request first to get the cookie.', false);
				}
			});

			// Trigger sails.initialize() callback if specified
			cb && cb(null, sails);
		});

		// Check for port conflicts
		// Ignore this check if explicit host is set
		if(!sails.explicitHost && !sails.express.app.address()) {
			sails.log.error('Trying to start server on port ' + sails.config.port + '...');
			sails.log.error('But something else is already running on that port!');
			sails.log.error('Please disable the other server, or choose a different port, and try again.');
			process.exit(1);
		}

		if (sails.explicitHost) {
			sails.log("Restricting access to host: "+sails.explicitHost);
			failureTimer = setTimeout(function failedToStart(){
				sails.log.warn("");
				sails.log.warn("Server doesn't seem to be starting.");
				sails.log.warn("Perhaps something else is already running on port "+sails.config.port+ " with hostname " + sails.explicitHost + "?");
			},2500);
		}

	}
}

/**
 * Kill the http and socket.io servers
 */
function lowerSails(cb) {
	// Socket.io server is stopped automatically when express server is killed
	sails.express.server.close();
}

/**
 * Run the grunt build task
 */
function build (taskName, cb) {
	sails.spawnGrunt = require('./automation')(taskName, cb);
}


// Export logic
module.exports = {

	// Stop the server
	lower	: lowerSails,

	// Start the server
	lift	: liftSails,

	// Direct access to load and initialize, for testing
	load	: loadSails,
	initialize	: initSails,

	// Export sails object
	sails	: sails,

	// Export logger
	log		: sails.log,

	build	: build
};
