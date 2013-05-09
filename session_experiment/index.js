////////////////////////////////////////////////////////////////////
// Approach
//
// Use Connect's special Redis client (which automatically 
// handles resolves sid encryption and knowing which Redis key to use)
////////////////////////////////////////////////////////////////////

// Basic libs
var express = require('express'),
	socketio = require('socket.io'),
	redis = require('socket.io/node_modules/redis');

// Logic to handle serialization/deserialization of connect cookies
var parseConnectCookie = require('./cookie');

// Keep track of session+cookie configuration information separately
// so it can be shared by both Socket.io and Express/Connect
var sessionSecret = 'kqsdjfmlksdhfhzirzeoibrzecrbzuzefcuercazeafxzeokwdfzeijfxcerig';
var cookieKey = 'connect.sid';





// Instantiate redis store object
// (requires anonymous redis client for some reason)
var ConnectRedisAdapter = require('connect-redis')(express);
var redisSessionStore = new ConnectRedisAdapter({
	host: 'localhost',
	port: 6379,
	client: redis.createClient()
});

// Create Express server
var app = express.createServer();
app.configure(function () {

	// Enable the basic things
	app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    
	// Configure Express session store to use connect-redis adapter
	app.use(express.session({
		secret: sessionSecret,
		store: redisSessionStore
	}));
});



// Set up socket.io to bind to the Express HTTP server
var io = socketio.listen(app);

// Create redis clients for use as Socket.io's message queue
var pub = redis.createClient(),
	sub = redis.createClient(),
	redisMessageQueueClient = redis.createClient();

// Configure redis MQ clients with server credentials
// pub.auth(password, function (err) { if (err) throw err; });
// sub.auth(password, function (err) { if (err) throw err; });
// client.auth(password, function (err) { if (err) throw err; });


// Load up Redis message queue library for socket.io
var IoRedis = require('socket.io/lib/stores/redis');

// Configure virgin socket.io server to use redis
io.set('store', new IoRedis({
	redis: redis,
	redisPub: pub,
	redisSub: sub,
	redisClient: redisMessageQueueClient
}));


// Instantiate redis client to facilitate accessing session
// Works for connect/express or socket.io, but mainly useful for socket.io
// since connect-redis does all the nice Express-y things for you.
var sessionClient = redis.createClient();


// Wait until the Express server is ready
app.listen(3000, function() {

	// Configure auth for ws(s):// server
	io.set('authorization', function(data, cb) {

		// Attach authorization policy to socket event receiver
		console.log("Cookie: ", data.headers.cookie);

		// Transform cookie into session id
		var cookies = parseConnectCookie(data.headers.cookie);
		data.sessionId = cookies[cookieKey];
		console.log("Parsed sid from cookie: ",parseConnectCookie(data.headers.cookie));

		// If session exists, use it
		sessionClient.get(data.sessionId, function(err, session) {
			if (err) return cb(err);

			// If no session already exists
			if (!session) {

				// Set up initial session
				sessionClient.set(data.sessionId, JSON.stringify({
					counter: 1
				}));
			}
		});

		acceptConnection();

		function rejectConnection(msg) {
			cb('Connection rejected. ' + (msg || ''));
		}

		function acceptConnection() {
			cb(null, true);
		}
	});

	// New socket connected, with session established
	io.sockets.on('connection', function(socket) {

		console.log('Socket was allowed to connect with session id:', socket.handshake.sessionId);

		// Handle ANY request here
		socket.on('message', function(data, cb) {

			console.log('Retrieving sesssion... ', socket.handshake.sessionId);

			sessionClient.get(socket.handshake.sessionId, function(err, session) {
				if (err) return cb(err);

				session = JSON.parse(session);
				console.log('Session retrieved!', session);

				// Update session
				// This basic example adds one to the counter in the session every time
				var updatedSession = {
					counter: session.counter + 1
				};
				updatedSession = JSON.stringify(updatedSession);

				// Persist updated session
				sessionClient.set(socket.handshake.sessionId, updatedSession);
				console.log('Session updated!', updatedSession);
				cb(null, session);
			});

		});
	});
});


// Handle an http request
app.get('/', function(req, res) {
	console.log('Cookie: ',req.cookies, ' was automatically set on the HTTP request by Connect-Redis.');
	res.json(req.session);
});
