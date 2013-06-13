var cookie = require('express/node_modules/cookie');
var parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie;
var ConnectSession = require('express/node_modules/connect').middleware.session.Session;

module.exports = function (handshake, accept) {

	// If a cookie override was provided in the query string, use it.
	// (e.g. ?cookie=sails.sid=a4g8dsgajsdgadsgasd)
	if (handshake.query.cookie) {
		handshake.headers.cookie = handshake.query.cookie;
	}

	// Parse and decrypt cookie and save it in the handshake
	if (handshake.headers.cookie) {
		
		// Decrypt cookie into session id using session secret
		// Maintain sessionID in socket so that the session can be queried before processing each incoming message
		handshake.cookie = cookie.parse(handshake.headers.cookie);
		handshake.sessionID = parseSignedCookie(handshake.cookie[sails.config.session.key], sails.config.session.secret);

		// TODO: make sessions disableable for high-scale scenarios with volatile messages, e.g. analytics

		// Get session
		require('../session/get')(handshake.sessionID, function(err, session) {

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
				sails.log.verbose("Generated new session....", handshake);
				accept(null, true);
			}

			// Parsed cookie matches a known session- onward!
			else {

				// Create a session object, passing our just-acquired session handshake
				handshake.session = new ConnectSession(handshake, session);
				sails.log.verbose("Connected to existing session....");
				accept(null, true);
			}
		});
	}
	else {

		return socketConnectionError(accept, 

				'No cookie transmitted with socket.io connection.  ' +
				'Are you trying to access your Sails.js server via socket.io on a 3rd party domain?  ' +
				'If you\'re ok with losing users\' session data, you can set `authorization: false` to disable cookie-checking.  ' +
				'Or you can send a JSONP request first from the client to the Sails.js server to get the cookie ' +
				'(be sure it\'s the same domain!!)',

				'No cookie transmitted with socket.io connection.');
	}
};

function socketConnectionError (accept, devMsg, prodMsg) {
	var msg;
	if (sails.config.environment === 'development') {
		msg = devMsg;
	}
	else msg = prodMsg;
	return accept(msg, false);
}