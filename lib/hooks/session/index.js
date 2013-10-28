module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var util	= require('../../../util'),
		crypto	= require("crypto"),
		uuid	= require('node-uuid'),
		cookie				= require('express/node_modules/cookie'),
		parseSignedCookie	= require('express/node_modules/connect').utils.parseSignedCookie,
		ConnectSession		= require('express/node_modules/connect').middleware.session.Session;



	// Prototype for pseudo connect session store wrapper
	// include method to trigger a save() of the session data
	function SocketIOSession (options) {
		var sid = options.sid,
			data = options.data;

		this.save = function (cb) {
			if (!sid) {
				sails.log.error('Could not save session, since socket is not associated with a session id.');
				sails.log.error('(this probably means the socket did not send a cookie-- is this a cross-origin socket?)');
				if (cb) cb('Could not save session.');
				return;
			}

			Session.set(sid, data, function (err) {
				if (err) {
					sails.log.error('Could not save session:');
					sails.log.error(err);
				}
				if (cb) cb(err);
			});
		};
	}



	// Session hook
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

				sails.log.warn('Session secret must be identified!');
				sails.log.warn('Automatically generating one for now...');
				if (sails.config.environment === 'production') {
					sails.log.error('But this generated session secret is not OK for production!');
					sails.log.error('It will change each time the server starts and break multi-instance deployments.');
					console.log();
					sails.log.error('To set up a session secret, add or update it in `config/session.js`:');
					sails.log.error('module.exports.session = { secret: "keyboardcat" }');
					console.log();
				}

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
		 * Create a new sid and build an empty session for it.
		 *
		 * @param {Function} cb
		 * @returns live session, with `id` property === new sid
		 */
		generate: function (cb) {

			// TODO: figure out how to generate a unique token cookie
			// which is reusable, and whether we can get it to "stick" on the client.
			// If not, no big deal.

			// Generate random "cookie"
			var simulatedCookie = uuid.v1();

			// Generate a session object w/ sid
			var session = new ConnectSession({
				cookie: simulatedCookie
			}, {
				cookie: {
					// Prevent access from client-side javascript
					httpOnly: true
				}
			});

			sails.log.verbose('Generated new session for socket without a cookie....');
			console.log('\n\n**** COOKIE GENERATED:: ***', simulatedCookie);
			console.log('\n\n**** SESSION GENERATED:: ***', session);

			// Will be persisted later...
			cb(null, session);

			// // Persist the new session
			// Session.set(sid, {}, function (err, sess) {
			// 	if (err) return cb(err);				
			// 	return cb(null, sess);
			// });

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

			// If sid doesn't exit in socket, create a session
			if ( ! (socket.handshake && socket.handshake.sessionID) ) {
				sails.log.warn('Could not fetch session, since connecting socket has no session id.');
				sails.log.warn('(this probably means the socket did not send a cookie-- is this a cross-origin socket?)');
				sails.log.warn('Using empty session (req.session === {}) for now...');

				// If a socket makes it here, even though its associated session is not specified, 
				// it's authorized as far as the app is concerned, so no need to do that again.
				// Instead, create a new sid and empty session:
				Session.generate(function (err, sessionData) {
					if (err) return cb(err);
					
					// Save sid to this socket so that the socket will be able to communicate 
					// with its new session next time:
					socket.handshake.sessionID = sessionData.id;

					return cb(null, new SocketIOSession({
						sid: sessionData.id,
						data: sessionData
					}));
				});

			}

			// Lookup session ID in socket
			var sid = socket.handshake.sessionID;

			
			// Retrieve session data from store
			Session.get(sid, function (err, sessionData) {
				if (err) {
					sails.log.error('Error retrieving session from socket.');
					return cb(err);
				}

				// sid is not known-- the session secret probably changed
				// (maybe server restarted and it was using an auto-generated secret)
				else if (!sessionData) {
					sails.log.error( 'Invalid or expired session ID (' + sid + ') on socket #'+socket.id );
					return cb('Could not fetch session data for socket #' + socket.id);
				}

				// Otherwise session exists and everything is ok.

				// Instantiate SocketIOSession (provides .save() method)
				// And extend it with session data
				return cb(null, new SocketIOSession({
					data: sessionData,
					sid: sid
				}));
			});
		}
	};


	return Session;
};
