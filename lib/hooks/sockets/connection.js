module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var interpret	= require('./interpreter/interpret')(sails),
		getVerb		= require('./interpreter/getVerb'),
		_			= require('lodash'),
		Session		= require('../../session')(sails);



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
			Session.fromSocket(socket, function sessionReady (err, session) {

				// If an error occurred loading the session, log what happened
				if (err) {
					sails.log.error(err);
					return;
				}

				// But continue on to run event handler either way
				sails.config.sockets.onConnect(session, socket);

			});
		}

		// Configurable custom onConnect logic here
		// (default: do nothing)
		if (sails.config.sockets.onDisconnect) {
			socket.on('disconnect', function onSocketDisconnect () {
				Session.fromSocket(socket, function sessionReady (err, session) {

					// If an error occurred loading the session, log what happened
					if (err) {
						sails.log.error(err);
						return;
					}

					// But continue on to run event handler either way
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
