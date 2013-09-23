module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _		= require('lodash'),
		crypto	= require("crypto");


	var Session = {

		// Generate session secret
		generateSecret: function () {
			
			// Combine random and case-specific factors into a base string
			var factors = {
				creationDate: (new Date()).getTime(),
				random: Math.random() * (Math.random() * 1000),
				nodeVersion: process.version
			};
			var basestring = '';
			_.each(factors, function (val) { basestring += val; });

			// Build hash
			var hash =	crypto.
						createHash("md5").
						update(basestring).
						digest("hex");

			return hash;
		},



		get: function (sessionId, cb) {
			return sails.config.session.store.get(sessionId, cb);
		},

		set: function (sessionId, data, cb) {
			return sails.config.session.store.set(sessionId, data, cb);
		},





		/**
		 * Load the Connect session data using the sessionID in the socket.io handshake object
		 * Mix-in the session.save() method for persisting the data back to the session store.
		 */

		fromSocket: function (socket, cb) {
			if (!socket.handshake || !socket.handshake.sessionID) {
				return cb(new Error('No valid session available from this socket.'));
			}

			// Retrieve session data from store
			var sessionKey = socket.handshake.sessionID;

			Session.get(sessionKey, function (err, sessionData) {

				if (err) {
					sails.log.error('Error retrieving session from socket.');
					sessionData = {};
					if (cb) cb(err);
					return;
				}

				// Create session for first time if necessary
				if (!_.isObject(sessionData)) {
					sessionData = {};
				}

				// Otherwise session exists and everything is ok.
				

				// Add method to trigger a save() of the session data
				function SocketIOSession () {
					this.save = function (cb) {
						Session.set(sessionKey, req.session, function (err) {
							if (err) {
								sails.log.error('Error encountered saving session:');
								sails.log.error(err);
							}
							if (cb) cb(err);
						});
					};
				}

				// Instantiate SocketIOSession
				var session = new SocketIOSession();

				// Provide access to session data
				_.extend(session, sessionData);

				return cb(null, session);

			});
		}
	};


	return Session;
};
