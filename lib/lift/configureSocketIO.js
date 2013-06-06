var _ = require('lodash');

module.exports = function(cb) {
	sails.log.verbose('Configuring socket.io...');

	// Socket.io server (WebSockets+polyfill to support Flash sockets, AJAX long polling, etc.)
	var io = sails.io = require('socket.io').listen(sails.express.server);

	// If logger option not set, use the default Sails logger config
	if (!sails.config.io.logger) {
		var logLevels = {
			'silent': 0,
			'error': 1,
			'warn': 2,
			'info': 3,	// Socket.io flips these around
			'debug': 4, // Socket.io flips these around
			'verbose': 4	// Socket.io has no concept of `verbose`
		};
		io.set('log level', logLevels[sails.config.log.level] || logLevels['info']);
		io.set('logger', {
			error: sails.log.error,
			warn: sails.log.warn,
			info: sails.log.info,
			debug: sails.log.verbose // socket.io considers `debug` the most verbose config, so we'll use verbose to represent it
		});
	}

	_.each(sails.config.io, function(value, propertyName) {

		// Setup custom socket.io MQ (pubsub) store(s)
		if (propertyName === 'adapter' && value === 'redis') {
			var redis = require('../../node_modules/connect-redis/node_modules/redis');
			var host = sails.config.io.host || '127.0.0.1';
			var port = sails.config.io.port || 6379;
			io.set('store', new(require('socket.io').RedisStore)({
				redisPub: redis.createClient(port, host, sails.config.io),
				redisSub: redis.createClient(port, host, sails.config.io),
				redisClient: redis.createClient(port, host, sails.config.io)
			}));
		}

		// Configure logic to be run before allowing sockets to connect
		else if (propertyName === 'authorization') {

			// Custom logic
			if (_.isFunction(value)) {
				io.set('authorization', value);
			}

			// `authorization: true` means go ahead and use the default behavior
			else if (value) {
				io.set('authorization', require('../io/authorization'));
			}

			// Otherwise skip the authorization step
			else io.set('authorization', false);
		}


		// In the general case, pass the configuration straight down to socket.io
		else io.set(propertyName, value);

	});


	// For later:
	// io.configure('development', function() {});
	// io.configure('production', function() {});


	// Link Socket.io requests to a controller/action
	// When a socket.io client connects, listen for the actions in the routing table
	// Authorization has already passed at this point!
	io.sockets.on('connection', require('../io/connection'));

	cb();
};