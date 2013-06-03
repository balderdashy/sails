var async = require('async');
var _ = require('lodash');

// Used to warn about possible issues if lift() is taking a very long time
var liftAbortTimer;

// Initialize the app
module.exports = function initSails(cb) {

	// Indicate that server is starting
	sails.log("Starting app at " + sails.config.appPath + "...");

	async.auto({

		'package.json': function (cb) {
			// Extend w/ data from Sails package.json
			var packageConfig = require('../configuration/package');
			sails.version = packageConfig.version;
			sails.dependencies = packageConfig.dependencies;
			cb();
		},

		configureSocketIO: function (cb) {

			// Configure socket.io
			var io = sails.io = socketio.listen(sails.express.app);

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
				//these don't really match with socket.io levels
				var logLevels = {
					"error": 0,
					"warn": 1,
					"debug": 2,
					"info": 3
				};

				io.set('log level', logLevels[sails.config.log.level] || logLevels["info"]);
			});
			io.configure('production', function() {
				//these don't really match with socket.io levels
				var logLevels = {
					"error": 0,
					"warn": 1,
					"debug": 2,
					"info": 3
				};

				io.set('log level', logLevels[sails.config.log.level] || logLevels["info"]);
			});

			// Apply transports config if it was provided
			if (sails.config.io.transports) {
				io.set('transports', sails.config.io.transports);
			}

			// Link Socket.io requests to a controller/action
			// When a socket.io client connects, listen for the actions in the routing table
			// Authorization has already passed at this point!
			io.sockets.on('connection', require('../io/connection'));

			// Configure auth for ws(s):// server
			io.set('authorization', require('../io/authorization'));

			cb();
		},

		
		// ????????????????????????????????????????????????????????????????????????????????
		// // Map Routes
		// // Link Express HTTP requests to a function which handles them
		// // *** NOTE: MUST BE AFTER app.configure in order for bodyparser to work ***
		// Router.listen(function(url, fn, httpVerb) {
		// 	// Use all,get,post,put,or delete conditionally based on http verb
		// 	// null === *any* of the HTTP verbs
		// 	if(!httpVerb) {
		// 		sails.express.app.all(url, fn);
		// 	} else {
		// 		_.isFunction(sails.express.app[httpVerb]) && sails.express.app[httpVerb](url, fn);
		// 	}
		// });
		// ????????????????????????????????????????????????????????????????????????????????


		startServer: ['package.json', function (cb) {

			// Start Express server (implicitly starts socket.io)
			// If host is explicitly declared, include it in express's listen() call
			sails.express.server = sails.express.app.listen(sails.config.port, sails.explicitHost, cb);
		}],


		handleFailureCases: ['startServer', function (cb) {

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
				liftAbortTimer = setTimeout(function failedToStart(){
					sails.log.warn("");
					sails.log.warn("Server doesn't seem to be starting.");
					sails.log.warn("Perhaps something else is already running on port "+sails.config.port+ " with hostname " + sails.explicitHost + "?");
				}, 2500);
			}

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

			cb();
		}]

	}, function (err) {
		clearTimeout(liftAbortTimer);
		return cb && cb(err);
	});

};

