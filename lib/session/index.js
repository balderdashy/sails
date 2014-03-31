module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('../util'),
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
			util.each(factors, function (val) { basestring += val; });

			// Build hash
			var hash =	crypto.
						createHash("md5").
						update(basestring).
						digest("hex");

			return hash;
		},


		/**
		 * Create a new connection to the session store
		 */
		initialize: function (cb) {
			var sessionConfig = sails.config.session;

			// Intepret session adapter config and "new up" a session store
			if (util.isObject(sessionConfig) && !util.isObject(sessionConfig.store)) {
				switch (sessionConfig.adapter) {

					// Session explicitly disabled
					case null:
						// Do nothing...
						break;

					// Supported session adapters
					case 'memory':
						sessionConfig.store = new(require('express').session.MemoryStore)();
						break;
					case 'redis':
						sessionConfig.store = new(require('connect-redis')(require('express')))(sessionConfig);
						break;
					case 'mongo':
						sessionConfig.store = new(require('connect-mongo')(require('express')))(sessionConfig);
						break;

					// Unknown session adapter
					default:
						return cb( new Error('Invalid session adapter :: ' + sessionConfig.adapter) );
				}
			}

			// Send back reference to Session module object
			// But also provides an opportunity for better error handling
			cb(null, Session);
		},

		/**
		 * @param {String} sessionId
		 * @param {Function} cb
		 *
		 * @api private
		 */
		get: function (sessionId, cb) {
			if ( !util.isFunction(cb) ) {
				throw new Error('Invalid usage :: `Session.get(sessionId, cb)`');
			}
			return sails.config.session.store.get(sessionId, cb);
		},

		/**
		 * @param {String} sessionId
		 * @param {} data
		 * @param {Function} [cb] - optional
		 *
		 * @api private
		 */
		set: function (sessionId, data, cb) {
			cb = util.optional(cb);
			return sails.config.session.store.set(sessionId, data, cb);
		},





		/**
		 * Create a session transaction
		 *
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
				if (!util.isObject(sessionData)) {
					sessionData = {};
				}

				// Instantiate SocketIOSession
				var session = new SocketIOSession();

				// Add method to trigger a save() of the session data
				function SocketIOSession () {
					this.save = function (cb) {
						Session.set(sessionKey, session, function (err) {
							if (err) {
								sails.log.error('Error encountered saving session:');
								sails.log.error(err);
							}
							if (cb) cb(err);
						});
					};
				}

				// Provide access to session data
				util.extend(session, sessionData);

				return cb(null, session);

			});
		}
	};


	return Session;
};
