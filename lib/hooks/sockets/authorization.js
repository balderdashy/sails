module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var cookie				= require('express/node_modules/cookie'),
		parseSignedCookie	= require('express/node_modules/connect').utils.parseSignedCookie,
		ConnectSession		= require('express/node_modules/connect').middleware.session.Session;



	/** 
	 * Fired after a socket is connected
	 */

	return function socketAttemptingToConnect (handshake, accept) {

		sails.log.verbose('Socket is trying to connect...');

		// If a cookie override was provided in the query string, use it.
		// (e.g. ?cookie=sails.sid=a4g8dsgajsdgadsgasd)
		if (handshake.query.cookie) {
			handshake.headers.cookie = handshake.query.cookie;
		}

		// Parse and decrypt cookie and save it in the handshake
		if (!handshake.headers.cookie) {
			return socketConnectionError(accept, 
				'Unable to parse the cookie that was transmitted for an incoming socket.io connection.  ' +
				'Perhaps you have an old browser tab open?  In that case, you can ignore this warning.  '+
				'Otherwise, are you are trying to access your Sails.js '+
				'server from a socket.io javascript client hosted on a 3rd party domain?  ' +
				' *-> You can override the cookie for a user entirely by setting ?cookie=... in the querystring of '+
				'your socket.io connection url on the client.'+
				' *-> You can send a JSONP request first from the javascript client on the other domain '+
				'to the Sails.js server to get the cookie first, then connect the socket.'+
				' *-> For complete customizability, to override the built-in session assignment logic in Sails '+
				'for socket.io requests, you can override socket.io\'s `authorization` logic with your own function '+
				'in `config/sockets.js`. ' +
				'Or disable authorization for incoming socket connection requests entirely by setting `authorization: false`.',
				'No cookie transmitted with socket.io connection request.'
			);
		}
			
		// Decrypt cookie into session id using session secret
		// Maintain sessionID in socket so that the session can be queried before processing each incoming message
		handshake.cookie = cookie.parse(handshake.headers.cookie);
		try {
			handshake.sessionID = parseSignedCookie(handshake.cookie[sails.config.session.key], sails.config.session.secret);
		}
		catch (e) {
			return socketConnectionError(accept,
				'Unable to parse the cookie that was transmitted for an incoming socket.io connection.  ' +
				'Perhaps you have an old browser tab open?  In that case, you can ignore this warning.  '+
				'Otherwise, are you are trying to access your Sails.js '+
				'server from a socket.io javascript client hosted on a 3rd party domain?  ' +
				' *-> You can override the cookie for a user entirely by setting ?cookie=... in the querystring of '+
				'your socket.io connection url on the client.'+
				' *-> You can send a JSONP request first from the javascript client on the other domain '+
				'to the Sails.js server to get the cookie first, then connect the socket.'+
				' *-> For complete customizability, to override the built-in session assignment logic in Sails '+
				'for socket.io requests, you can override socket.io\'s `authorization` logic with your own function '+
				'in `config/sockets.js`. ' +
				'Or disable authorization for incoming socket connection requests entirely by setting `authorization: false`.',
				'Invalid cookie transmitted with socket.io connection request.'
			);
		}


		// Get session
		sails.session.get(handshake.sessionID, function(err, session) {

			// An error occurred, so refuse the connection
			if(err) {
				return socketConnectionError(accept,
					'Error loading session from socket.io! \n' + err,
					'Error loading session from socket.io!');
			}

			// Cookie is present, but doesn't correspond to a known session
			// So generate a new session to match it.
			else if (!session) {
				handshake.session = new ConnectSession(handshake, {
					cookie: {
						// Prevent access from client-side javascript
						httpOnly: true
					}
				});
				sails.log.verbose("Generated new session for socket....", handshake);
				accept(null, true);
			}

			// Parsed cookie matches a known session- onward!
			else {

				// Create a session object, passing our just-acquired session handshake
				handshake.session = new ConnectSession(handshake, session);
				sails.log.verbose("Connected socket to existing session....");
				accept(null, true);
			}
		});
	};


	/**
	 * Fired when an internal server error occurs while authorizing the socket
	 */

	function socketConnectionError (accept, devMsg, prodMsg) {
		var msg;
		if (sails.config.environment === 'development') {
			msg = devMsg;
		}
		else msg = prodMsg;
		return accept(msg, false);
	}

};
