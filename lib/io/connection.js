var socketInterpreter = require('./interpreter');

module.exports = function(socket) {
	sails.log.verbose("New socket.io client connected!", socket.id);

	// Map routes
	socket.on('message', function(socketReq, fn) {
		socketInterpreter.route(socketReq, fn, socket);
	});
};