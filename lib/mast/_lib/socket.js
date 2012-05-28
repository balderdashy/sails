// Mast.Socket wraps around socket.io to provide a universal API 
// for programatic communication with the Sails backend
Mast.Socket =_.extend(
{	
	io:io,
	baseurl: window.location.origin,
	autoconnect: true,
	initialize: function() {
		_.bindAll(this);
		if (this.autoconnect) {
			this.connect();
		}
				
				
		// Override Backbone.sync
		Backbone.sync = function(method, model, options) {
			var resp;
					
			switch (method) {
				case "read":
					model.id ? Mast.Socket.find(model,options) : Mast.Socket.findAll(model,options);
					break;
				case "create":
					resp = Mast.Socket.create(model);
					break;
				case "update":
					resp = Mast.Socket.update(model);
					break;
				case "delete":
					resp = Mast.Socket.destroy(model);
					break;
			}
		};
	},
			
	// CRUD methods for Backbone usage
	// (reference: http://documentcloud.github.com/backbone/docs/backbone-localstorage.html)
	create: function(model,options){
		var url = (model.url || model.collection.url) + "/create";
		//				console.log("RUNNING CREATE",arguments,url);
		this._socket.emit(url,{},function(result) {
			//					console.log("result",result);
			try {
				options.success(JSON.parse(result));
			}
			catch (e) {
				throw new Error("Server response could not be parsed:",result,e);
			}
		});
	},
	find: function(model){
		var url = (model.url || model.collection.url) + "/find";
	},
	findAll: function(model,options){
		var url = (model.url || model.collection.url) + "/findAll";
		this._socket.emit(url,{},function(result) {
			try {
				options.success(JSON.parse(result));
			}
			catch (e) {
				debug.debug({
					result: result,
					e: e,
					options: options
				});
				throw new Error("Server response could not be parsed:");
			}
		});
	},
	update: function(model){
		var url = (model.url || model.collection.url) + "/update";
	},
	destroy: function(model){
		var url = (model.url || model.collection.url) + "/destroy";
	},
				
	// TODO: Investigate removing this and doing it all automatically
	events: {
		connect: "status"
	},

	// Report status of socket
	status: function() {
		debug.debug("Socket " + (this.connected ? "connected to "+this.baseurl+".":"not connected!!!"));
	},

	// Connect to socket
	connect: function(baseurl) {
		if (this.connected) {
			throw new Error(
				"Can't connect to "+baseurl+ " because you're "+
				"already connected to a socket @ " + this.baseurl+"!"
				);
		}
					
		this.baseurl = baseurl || this.baseurl;
		this._socket = io.connect(this.baseurl);
					
		// Map events
		_.each(this.events,function(eventFn,eventName) {
			Mast.Socket._socket.on(eventName,this[eventFn]);
		},this);
					
		this.connected = true;
	}
},Backbone.Events)