module.exports = function(sails) {


	/**
	 * Module dependencies.
	 */

	var _		= require('lodash'),
	interpret	= require('./interpreter/interpret')(sails),
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
		mapRoute('options');

		// Map a socket message to the router
		function mapRoute (messageName) {
			socket.on(messageName, function (socketReq, callback) {
				sails.log.verbose('Routing message over socket: ', socketReq);

				var verb = getVerb(socketReq, messageName);

				// Translate socket.io message to an Express-looking request
				var request = interpret(socketReq, function (body, status) {
					console.log('RESPONSE CAME BACK!!!!');
				}, socket, verb);

				console.log('req: ',request.req);

				// Route socket.io request
				sails.emit('request', request.req, request.res);
			});
		}
	};

};
