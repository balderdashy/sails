////////////////////////////////////////////////////////////////////
// Approach
//
// ...
//
// Very important:
// https://github.com/senchalabs/connect/issues/588
//
////////////////////////////////////////////////////////////////////

var _ = require('underscore');

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



// Instantiate redis client to facilitate accessing session
// Works for connect/express or socket.io, but mainly useful for socket.io
// since connect-redis does all the nice Express-y things for you.
var sessionClient = redis.createClient();

// Instantiate redis store object
// (requires anonymous redis client for some reason)
var ConnectRedisAdapter = require('connect-redis')(express);
var redisSessionStore = new ConnectRedisAdapter({
	host: 'localhost',
	port: 6379,
	client: sessionClient
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


// Returns a connect session object
// NOTE: this is the minimum required content of the session key
function buildConnectSession(options) {
	var tenYearsInMs = 1000*60*60*24*365*10;
	options = options || {};

	return _.extend({
		lastAccess: (new Date()).getTime(),
		cookie: _.extend({
			originalMaxAge: 14400000,
			expires: new Date( (new Date()).getTime() + tenYearsInMs),
			httpOnly: true,
			path: '/'
		}, options.cookie || {})
	}, options);
	
	// e.g. 
	// lastAccess: 1368080991745,
	// cookie: {
	// 	originalMaxAge: 14400000,
	// 	expires: '2013-05-09T10:29:50.179Z',
	// 	httpOnly: true,
	// 	path: '/'
	// }
}


// Wait until the Express server is ready
app.listen(3000, function() {

	// Configure auth for ws(s):// server
	io.set('authorization', function(data, cb) {

		// Attach authorization policy to socket event receiver
		console.log("Cookie: ", data.headers.cookie);

		// Transform cookie into session id
		var cookies = parseConnectCookie(data.headers.cookie);
		data.sessionId = cookies[cookieKey];
		console.log("Parsed sid "+data.sessionId+" from cookie "+data.headers.cookie);

		// Look up the session
		sessionClient.get('sess:'+data.sessionId, function(err, session) {
			if (err) return cb(err);

			// If no session already exists
			if (!session) {

				// Set up initial session
				sessionClient.set('sess:'+data.sessionId, JSON.stringify(buildConnectSession({
					counter: 1
				})));
			}

			// Otherwise, a session exists so use it


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

			sessionClient.get('sess:'+socket.handshake.sessionId, function(err, session) {
				if (err) return cb(err);

				session = JSON.parse(session);
				console.log('Session retrieved!', session);

				// Update session
				// This basic example adds one to the counter in the session every time
				var updatedSession = buildConnectSession({
					counter: session.counter + 1
				});
				updatedSession = JSON.stringify(updatedSession);

				// Persist updated session
				sessionClient.set('sess:'+socket.handshake.sessionId, updatedSession);
				console.log('Session updated!', updatedSession);
				cb(null, session);
			});

		});
	});
});


// Handle an http request
app.get('/', function(req, res) {
	console.log('Cookie: ',req.cookies, ' was automatically set on the HTTP request by Connect-Redis.');

	req.session.counter = req.session.counter + 1;
	console.log("Session updated!", req.session);
	res.json(req.session);
});
