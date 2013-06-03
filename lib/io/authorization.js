module.exports = function (data, accept) {
	
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
};