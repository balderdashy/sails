var socketInterpreter = require('./interpreter');

// Fired after a socket is connected
module.exports = function(socket) {
	sails.log.verbose('A socket.io client ('+ socket.id + ') connected successfully!');

	// Map routes
	socket.on('message', function(socketReq, fn) {
		socketInterpreter.route(socketReq, fn, socket);
	});
};