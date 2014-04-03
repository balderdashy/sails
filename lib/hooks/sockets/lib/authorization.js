module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var util = require('util'),
		cookie				= require('express/node_modules/cookie'),
		getSDKMetadata				= require('./getSDKMetadata'),
		parseSignedCookie	= require('express/node_modules/connect').utils.parseSignedCookie,
		ConnectSession		= require('express/node_modules/connect').middleware.session.Session;



	/** 
	 * Fired after a socket is connected
	 */

	return function socketAttemptingToConnect (handshake, accept) {

		// If a cookie override was provided in the query string, use it.
		// (e.g. ?cookie=sails.sid=a4g8dsgajsdgadsgasd)
		if (handshake.query.cookie) {
			handshake.headers.cookie = handshake.query.cookie;
		}

		var sdk = getSDKMetadata(handshake);
		sails.log.verbose(util.format('%s client (v%s) is trying to connect a socket...', sdk.platform, sdk.version));

		var TROUBLESHOOTING =
		'Perhaps you have an old browser tab open?  In that case, you can ignore this warning.'+'\n'+
		'Otherwise, are you are trying to access your Sails.js ' + '\n'+
		'server from a socket.io javascript client hosted on a 3rd party domain?  ' + '\n'+
		' *-> You can override the cookie for a user entirely by setting ?cookie=... in the querystring of '+ '\n'+
		'your socket.io connection url on the client.'+ '\n'+
		' *-> You can send a JSONP request first from the javascript client on the other domain '+ '\n'+
		'to the Sails.js server to get the cookie first, then connect the socket.'+ '\n'+
		' *-> For complete customizability, to override the built-in session assignment logic in Sails '+ '\n'+
		'for socket.io requests, you can override socket.io\'s `authorization` logic with your own function '+ '\n'+
		'in `config/sockets.js`. ' + '\n'+
		'Or disable authorization for incoming socket connection requests entirely by setting `authorization: false`.'+'\n';


		// Parse and decrypt cookie and save it in the handshake
		if (!handshake.headers.cookie) {
			return socketConnectionError(accept, 
				'Cannot load session for an incoming socket.io connection...  ' + '\n'+
				'No cookie was sent!\n'+
				TROUBLESHOOTING,
				'Cannot load session. No cookie transmitted.'
			);
		}
			
		// Decrypt cookie into session id using session secret
		// Maintain sessionID in socket handshake so that the session
		// can be queried before processing each incoming message from this
		// socket in the future.
		try {
			handshake.cookie = cookie.parse(handshake.headers.cookie);
			handshake.sessionID = parseSignedCookie(handshake.cookie[sails.config.session.key], sails.config.session.secret);
		}
		catch (e) {
			return socketConnectionError(accept,
				'Unable to parse the cookie that was transmitted for an incoming socket.io connect request:\n' +
				util.inspect(e) + '\n' + TROUBLESHOOTING,
				'Cannot load session. Cookie could not be parsed.'
			);
		}


		// Look up this socket's session id in the Connect session store
		// and see if we already have a record of 'em.
		sails.session.get(handshake.sessionID, function(err, session) {

			// An error occurred, so refuse the connection
			if(err) {
				return socketConnectionError(accept,
					'Error loading session during socket connection! \n' + err,
					'Error loading session.');
			}

			// Cookie is present (there is a session id), but it doesn't
			// correspond to a known session in the session store.
			// So generate a new, blank session.
			else if (!session) {
				handshake.session = new ConnectSession(handshake, {
					cookie: {
						// Prevent access from client-side javascript
						httpOnly: true
					}
				});
				sails.log.verbose("Generated new session for socket....", handshake);

				// TO_TEST:
				// do we need to set handshake.sessionID with the id of the new session?
				
				// TO_TEST:
				// do we need to revoke/replace the cookie as well?
				// how can we do that w/ socket.io?
				// can we access the response headers in the http UPGRADE response?
				// or should we just clear the cookie from the handshake and call it good?
				// e.g
				// var date = new Date();
		    // date.setTime(date.getTime()+(days*24*60*60*1000));
		    // var expires = "; expires="+date.toGMTString();
		    // handshake.headers.cookie = name+"="+value+expires+"; path=/";

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
