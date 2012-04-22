(function (){
	
	// Initialize global namespace and defaults from serverside config
	Sails = {
		socket: {
			url: 'http://localhost:5008'
		}
	};
	
	var socket = Sails.socket.server = io.connect(Sails.socket.url);
	
	socket.on('connect',function(d) {
		debug.debug("Socket connection established.");
	})
	
})();