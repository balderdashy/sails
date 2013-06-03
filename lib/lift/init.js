// Initialize the app (start the servers)
module.exports = function initSails(cb) {

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
};