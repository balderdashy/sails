module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('sails/lib/util'),
		crypto	= require("crypto");


	var Session = {


		defaults: {
			session: {
	            adapter: 'memory',
				key: "sails.sid"
			}
		},

		/**
		 * Normalize and validate configuration for this hook.
		 * Then fold any modifications back into `sails.config`
		 */
		configure: function () {

			// Validate config
			// Ensure that secret is specified if a custom session store is used
			if(sails.config.session) {
				if(!util.isObject(sails.config.session)) {
					throw new Error('Invalid custom session store configuration!\n' + 
						'\n' + 
						'Basic usage ::\n' + 
						'{ session: { adapter: "memory", secret: "someVerySecureString", /* ...if applicable: host, port, etc... */ } }' +
						'\n\nCustom usage ::\n' +
						'{ session: { store: { /* some custom connect session store instance */ }, secret: "someVerySecureString", /* ...custom settings.... */ } }'
					);
				}

			}

			// If session config is set, but secret is undefined, set a secure, one-time use secret
			if(!sails.config.session || !sails.config.session.secret) {
				sails.log.warn('Session secret must be identified!\n' + 
					'Should be of the form: `sails.config.session = { secret: "someVerySecureString" }`' +
					'\nAutomatically generating one for now...' +
					'\n(Note: This will change each time the server starts and break multi-instance deployments.)'+
					'\ne.g. To set up a session secret, add or update it in `config/session.js`:'+
					'\nmodule.exports.session = { secret: "keyboardcat" }');
				sails.config.session.secret = Session.generateSecret();
			}
		},

		/**
		 * Create a connection to the configured session store
		 * and keep it around
		 *
		 * @api private
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

			// Save reference in `sails.session`
			sails.session = Session;

			return cb();
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
				util.extend(session, sessionData);

				return cb(null, session);

			});
		}
	};


	return Session;
};
