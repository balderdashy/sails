(function (){
	
	// Initialize global namespace and defaults from serverside config
	Sails = {
		socket: {
			url: 'http://localhost:5008'
		}
	};
	
	socket = Sails.socket.server = io.connect(Sails.socket.url);
	
	socket.on('connect',function(d) {
		debug.debug("Socket connection established.");
		
		debug.debug("Emitting event to "+window.location.pathname);
		socket.emit(window.location.pathname,{
			hi: true
		}, function (data) {
			console.log("Received: ",data);
		});
	})
	
})();