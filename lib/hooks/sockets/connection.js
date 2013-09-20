module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var interpret	= require('./interpreter/interpret')(sails),
		getVerb		= require('./interpreter/getVerb'),
		_			= require('lodash');



	/** 
	 * Fired after a socket is connected
	 */

	return function onConnect (socket) {
		sails.log.verbose('A socket.io client ('+ socket.id + ') connected successfully!');
		
		// Legacy support of `message`
		mapRoute('message');

		// Verb support
		mapRoute('get');
		mapRoute('post');
		mapRoute('put');
		mapRoute('delete');
		
		// Configurable custom onConnect logic here
		// (default: do nothing)
		if (sails.config.sockets.onConnect) {
			// TODO: bootstrap the session like we would on a request
			// (maybe even just put together a `req` object)
			sails.config.sockets.onConnect(socket);
		}

		// Configurable custom onConnect logic here
		// (default: do nothing)
		if (sails.config.sockets.onDisconnect) {

			socket.on('disconnect', function () {
				var Session		= require('../../session')(sails);

				// Retrieve session data from store
				var sessionKey = socket.handshake.sessionID;

				Session.get(sessionKey, function (err, sessionData) {

					if (err) {
						sails.log.error('Error retrieving session: ' + err);
						sessionData = {};
						return;
						// return cb('Error retrieving session: ' + err);
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


					// TODO: bootstrap the session like we would on a request
					// (maybe even just put together a `req` object)
					sails.config.sockets.onDisconnect(session, socket);

				});
		    });
		}

		// Map a socket message to the router
		function mapRoute (messageName) {
			socket.on(messageName, function (socketReq, callback) {
				
				sails.log.verbose('Routing message over socket: ', socketReq);
				
				callback = callback || function noCallback(body, status) {
					sails.log.error('No callback specified!');
				};

				var verb = getVerb(socketReq, messageName);


				// Translate socket.io message to an Express-looking request
				interpret(socketReq, callback, socket, verb, function requestBuilt (err, request) {
					
					// If interpretation fails, log the error and do nothing
					if (err) {
						sails.log.error(err);
						return;
					}

					// Route socket.io request
					sails.emit('router:request', request.req, request.res);
				});

			});
		}
	};

};
