var app = require('express').createServer(),
	io = require('socket.io').listen(app);


// Configure to use redis
var redisClient = require('./redis')(io);

// Micro-app
app.listen(3000, function () {

	// Configure auth for ws(s):// server
	io.set('authorization', function(data, cb) {

		// Attach authorization policy to socket event receiver
		console.log("Cookie: " , data.headers.cookie);

		// TODO: transform cookie into session id
		data.sessionId = data.headers.cookie;

		// If session exists, use it
		redisClient.get('session:'+data.sessionId, function (err, session) {
			if (err) return cb(err);

			// If no session already exists
			if (!session) {
				
				// Set up initial session
				redisClient.set('session:'+data.sessionId, JSON.stringify({
					counter: 1
				}));
			}
		});

		acceptConnection();

		function rejectConnection (msg) {
			cb('Connection rejected. ' + (msg || ''));
		}

		function acceptConnection () {
			cb(null, true);
		}
	});

	// New socket connected, with session established
	io.sockets.on('connection', function (socket) {

		console.log('Socket was allowed to connect with session id:',socket.handshake.sessionId);

		// Handle ANY request here
		socket.on('message', function (data, cb) {

			console.log('Retrieving sesssion... ',socket.handshake.sessionId);

			redisClient.get('session:'+socket.handshake.sessionId, function (err, session) {
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
				redisClient.set('session:'+socket.handshake.sessionId, updatedSession);
				console.log('Session updated!', updatedSession);
				cb(null, session);
			});
			
		});

	});

	// Regularly check that session still works
	// setInterval(function (){
	// 	io.sockets.emit('session heartbeat');
	// }, 1500);
});