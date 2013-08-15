module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var interpret	= require('./interpreter/interpret')(sails),
		getVerb		= require('./interpreter/getVerb');



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
					if (err) {
						sails.log.error(err);
						return;
					}

					// Route socket.io request
					sails.emit('router:request', request.req, request.res);
				});

			});
		}

		if (sails.config.sockets.connection && typeof sails.config.sockets.connection === 'function') {
			sails.log.verbose('Custom on connection logic');
			sails.config.sockets.connection(socket);
		}
	};

};
