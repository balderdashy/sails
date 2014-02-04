/**
 * Module dependencies.
 */

var util	= require('sails-util'),
	uuid	= require('node-uuid'),
	generateSecret		= require('./generateSecret'),
	cookie				= require('express/node_modules/cookie'),
	parseSignedCookie	= require('express/node_modules/connect').utils.parseSignedCookie,
	ConnectSession		= require('express/node_modules/connect').middleware.session.Session;


module.exports = function (sails) {


	//////////////////////////////////////////////////////////////////////////////
	// TODO:
	//
	// All of this craziness can be replaced by making the socket.io interpreter
	// 100% connect-compatible (it's close!).  Then, the connect cookie parser
	// can be used directly with Sails' simulated req and res objects.
	//
	//////////////////////////////////////////////////////////////////////////////



	/**
	 * Prototype for the connect session store wrapper used by the sockets hook.
	 * Includes a save() method to persist the session data.
	 */
	function SocketIOSession (options) {
		var sid = options.sid,
			data = options.data;

    // Merge data directly into instance to allow easy access on `req.session` later
    util.defaults(this, data);

		this.save = function (cb) {
			
			if (!sid) {
				sails.log.error('Could not save session, since socket is not associated with a session id.');
				sails.log.error('(this probably means the socket did not send a cookie-- is this a cross-origin socket?)');
				if (cb) cb('Could not save session.');
				return;
			}

			// Persist session
			Session.set(sid, _.omit(this,'save'), function (err) {
				if (err) {
					sails.log.error('Could not save session:');
					sails.log.error(err);
				}
				if (cb) cb(err);
			});
		};

		// Set the data on this object, since it will be used as req.session
		util.extend(this, options.data);
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

				sails.log.verbose('Session secret not defined-- automatically generating one for now...');

				if (sails.config.environment === 'production') {
					sails.log.warn('Session secret must be identified!');
					sails.log.warn('Automatically generating one for now...');

					sails.log.error('This generated session secret is NOT OK for production!');
					sails.log.error('It will change each time the server starts and break multi-instance deployments.');
					console.log();
					sails.log.error('To set up a session secret, add or update it in `config/session.js`:');
					sails.log.error('module.exports.session = { secret: "keyboardcat" }');
					console.log();
				}

				sails.config.session.secret = generateSecret();
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
		 * @param {Object} handshake - a socket "handshake" -- basically, this is like `req`
		 * @param {Function} cb
		 * @returns live session, with `id` property === new sid
		 */
		generate: function (handshake, cb) {

			// Generate a session object w/ sid
			// This is important since we need this sort of object as the basis for the data 
			// we'll save directly into the session store.
			// (handshake is a pretend `req` object, and 2nd argument is cookie config)
			var session = new ConnectSession(handshake, {
				cookie: {
					// Prevent access from client-side javascript
					httpOnly: true,

					// Restrict to path
					path: '/'
				}
			});

			// Next, persist the new session
			Session.set(session.id, session, function (err) {
				if (err) return cb(err);
				sails.log.verbose('Generated new session (',session.id,') for socket....');
				
				// Pass back final session object
				return cb(null, session);
			});

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
		 *
		 * Functionally equivalent to connect's sessionStore middleware.
		 */

		fromSocket: function (socket, cb) {

			// If a socket makes it here, even though its associated session is not specified, 
			// it's authorized as far as the app is concerned, so no need to do that again.
			// Instead, use the cookie to look up the sid, and then the sid to look up the session data


			// If sid doesn't exit in socket, we have to do a little work first to get it
			// (or generate a new one-- and therefore a new empty session as well)
			if ( !socket.handshake.sessionID && !socket.handshake.headers.cookie ) {

				// If no cookie exists, generate a random one (this will create a new session!)
				var generatedCookie = sails.config.session.key + '=' + uuid.v1();
				socket.handshake.headers.cookie = generatedCookie;
				sails.log.warn('Could not fetch session, since connecting socket (',socket.id,') has no cookie.');
				sails.log.warn('Is this a cross-origin socket..?)');
				sails.log.verbose('Generated a one-time-use cookie:',generatedCookie);
				sails.log.verbose('This will result in an empty session, i.e. (req.session === {})');


				// Convert cookie into `sid` using session secret
				// Maintain sid in socket so that the session can be queried before processing each incoming message
				socket.handshake.cookie = cookie.parse(generatedCookie);
				// Parse and decrypt cookie and save it in the socket.handshake
				socket.handshake.sessionID = parseSignedCookie(socket.handshake.cookie[sails.config.session.key], sails.config.session.secret);

				// Generate and persist a new session in the store
				Session.generate(socket.handshake, function (err, sessionData) {
					if (err) return cb(err);
					sails.log.silly('socket.handshake.sessionID is now :: ',socket.handshake.sessionID);

					// Provide access to adapter-agnostic `.save()`
					return cb(null, new SocketIOSession({
						sid: sessionData.id,
						data: sessionData
					}));
				});
				return;
			}


			// Convert cookie into `sid` using session secret
			// Maintain sid in socket so that the session can be queried before processing each incoming message
			socket.handshake.cookie = cookie.parse(socket.handshake.headers.cookie);
			// Parse and decrypt cookie and save it in the socket.handshake
			socket.handshake.sessionID = parseSignedCookie(socket.handshake.cookie[sails.config.session.key], sails.config.session.secret);

			// If sid DOES exist, it's easy to look up in the socket
			var sid = socket.handshake.sessionID;
		
			// Cache the handshake in case it gets wiped out during the call to Session.get
			var handshake = socket.handshake;

			// Retrieve session data from store
			Session.get(sid, function (err, sessionData) {

				if (err) {
					sails.log.error('Error retrieving session from socket.');
					return cb(err);
				}

				// sid is not known-- the session secret probably changed
				// Or maybe server restarted and it was:
				// (a) using an auto-generated secret, or
				// (b) using the session memory store
				// and so it doesn't recognize the socket's session ID.
				else if (!sessionData) {
					sails.log.verbose('A socket ('+socket.id+') is trying to connect with an invalid or expired session ID (' + sid + ').');
					sails.log.verbose('Regnerating empty session...');					

					Session.generate(handshake, function (err, sessionData) {
						if (err) return cb(err);

						// Provide access to adapter-agnostic `.save()`
						return cb(null, new SocketIOSession({
							sid: sessionData.id,
							data: sessionData
						}));
					});
				}

				// Otherwise session exists and everything is ok.

				// Instantiate SocketIOSession (provides .save() method)
				// And extend it with session data
				else return cb(null, new SocketIOSession({
					data: sessionData,
					sid: sid
				}));
			});
		}
	};


	return Session;
};
