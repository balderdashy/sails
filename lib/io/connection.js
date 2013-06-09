// Route incoming socket.io message using the shared Express router
var route = require('./interpreter/route');

// Fired after a socket is connected
module.exports = function(socket) {
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
		socket.on(messageName, function (socketReq, fn) {
			route(socketReq, fn, socket, messageName);
		});
	}
};