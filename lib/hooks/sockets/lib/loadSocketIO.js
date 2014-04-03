module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var		util			= require( 'sails-util'),
			SocketServer	= require('socket.io'),
			RedisStore		= require('socket.io/lib/stores/redis'),
			Redis			= require('socket.io/node_modules/redis'),
			Socket			= {
				authorization	: require('./authorization')(sails),
				connection		: require('./connection')(sails)
			};


	/**
	 * loadSocketIO()
	 * @param {Function} cb
	 *
	 * Prepare the nascent ws:// server (but don't listen for connections yet)
	 */

	return function loadSocketIO (cb) {
		sails.log.verbose('Configuring socket (ws://) server...');

		var socketConfig = sails.config.sockets;

		// Socket.io server (WebSockets+polyfill to support Flash sockets, AJAX long polling, etc.)
		var io = sails.io = sails.ws = 
		SocketServer.listen(sails.hooks.http.server, {
			logger: {
				info: function (){}
			}
		});

		// If logger option not set, use the default Sails logger config
		if (!socketConfig.logger) {
			var logLevels = {
				'silent': 0,
				'error': 1,
				'warn': 2,
				'debug': 4, // Socket.io flips these around (and it considers debug more verbose than `info`)
				'info': 3,	// Socket.io flips these around
				'verbose': 4	// Socket.io has no concept of `verbose`
			};
			io.set('log level', logLevels[sails.config.log.level] || logLevels['info']);
			io.set('logger', {
				error: sails.log.error,
				warn: sails.log.warn,
				info: sails.log.verbose,
				debug: sails.log.verbose // socket.io considers `debug` the most verbose config, so we'll use verbose to represent it
			});
		}



		// Process the Config File
		util.each(socketConfig, function(value, propertyName) {

			// Handle `Memory` adapter value
			if (propertyName === 'adapter' && value === 'memory') return;

			// Setup custom socket.io MQ (pubsub) store(s)
			if (propertyName === 'adapter' && value === 'redis') {
				var host = socketConfig.host || '127.0.0.1';
				var port = socketConfig.port || 6379;

				var pub = createRedisConnection(port, host);
				var sub = createRedisConnection(port, host);
				var client = createRedisConnection(port, host);

				var storeConfig = {
					redisPub: pub,
					redisSub: sub,
					redisClient: client
				};

				// Add a pointer to the redis, required with Auth
				if(socketConfig.pass) {
					storeConfig.redis = Redis;
				}

				io.set('store', new RedisStore(storeConfig));
				return;
			}

			// Configure logic to be run before allowing sockets to connect
			if (propertyName === 'authorization') {

				// Custom logic
				if (util.isFunction(value)) {
					io.set('authorization', value);
					return;
				}

				// `authorization: true` means go ahead and use the default behavior
				if (value === true) {
					io.set('authorization', Socket.authorization);
					return;
				}

				// Otherwise skip the authorization step
				io.set('authorization', false);

				return;
			}

			// If value is explicitly undefined, do nothing
			if (util.isUndefined(value)) return;

			// In the general case, pass the configuration straight down to socket.io
			io.set(propertyName, value);

		});


		// For later:
		// io.configure('development', function() {});
		// io.configure('production', function() {});


		// Link Socket.io requests to a controller/action
		// When a socket.io client connects, listen for the actions in the routing table
		// Authorization has already passed at this point!
		io.sockets.on('connection', Socket.connection);

		cb && cb();
	};


	/**
	 * Creates a new Redis Connection if specified.
	 *
	 * Can be used to connect to remote server with authentication if
	 * `pass` is declared in the socketConfig file.
	 */

	function createRedisConnection(port, host) {

		var socketConfig = sails.config.sockets;

		// Create a new client using the port, host and other options
		var client = Redis.createClient(port, host, socketConfig);

		// If a password is needed use client.auth to set it
		if(socketConfig.pass) {
			client.auth(socketConfig.pass, function(err) {
		        if (err) throw err;
		    });
		}

		// If a db is set select it on the client
		if (socketConfig.db) {
			client.select(socketConfig.db);
		}

		return client;
	}

};
