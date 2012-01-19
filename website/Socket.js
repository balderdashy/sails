var Socket = {

	connect: function (callback) {
		this.socket = io.connect(Chatkin.path);
		this.on('connectedSuccessfully',function(response) {
			Log.log("Connected!");

			// Now pass this information into the user model to populate it
			User.onDataFetched(response);

			// Listen for disconnect
			Socket.on('disconnect',this.disconnect);

			Socket.connected = true;
			callback();
		});
	},

	on: function (eventName,callback) {
		this.socket.on(eventName, callback);
	},

	emit: function (method,data,callback, numTimesToRetry) {
		// Validate:
		if (!_.isString(method) || (callback && !_.isFunction(callback)) ) {
			throw new Error ("Invalid arguments passed to Socket:",arguments);
		}

		if (!numTimesToRetry || !callback) {
			if (!callback) {
				callback = function(){}
			}
			this.socket.emit(method,data,callback);
		}
		else {
			var nag = new Nag(numTimesToRetry);
			nag.start(function () {
				Socket.socket.emit(method,data,nag.until(callback));
			});
		}
	},

	emitUntilSuccess: function (method,data,callback) {
		Socket.emit(method,data,callback,50);
	},

	disconnect: function () {
		this.socket.disconnect();
	}
}