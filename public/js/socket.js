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
			try {
				data = JSON.parse(data);
				console.log("Received JSON: ",data);
			}
			catch (e) {
				console.log("Received non-JSON: ",data);	
			}
		});
	})
	
})();