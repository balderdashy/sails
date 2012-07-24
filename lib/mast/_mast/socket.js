var bbGetValue = function(object, prop) {
	if (!(object && object[prop])) return null;
	return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};
  
// // Mast.Socket wraps around socket.io to provide a universal API  
// for programatic communication with the Sails backend
Mast.Socket =_.extend(
{	
	io: window.io,
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
		var url = (model.url() || model.collection.url) + "/create";

		this._socket.emit(url,JSON.stringify(model.toJSON()),function(result) {
			try {
				var parsedResult = JSON.parse(result);
			}
			catch (e) {
				throw new Error("Server response could not be parsed:",result,e);
			}
			
			// Call success callback if specified
			options && options.success && options.success(parsedResult);
		});
	},
	find: function(model){
		var url = (model.url || model.collection.url) + "/find";
	},
	findAll: function(collection,options){
		var url = (collection.url) + "/findAll";

		this._socket.emit(url,{},function(result) {
			try {
				var parsedResult = JSON.parse(result);
			}
			catch (e) {
				debug.debug({
					result: result,
					e: e,
					options: options
				});
				throw new Error("Server response could not be parsed:");
			}
			
			options.success(parsedResult);
		});
	},
	update: function(model,options){
		var url = model.url();
		
		// Remove trailing slash and add /destroy to url
		url = url.replace(/\/*$/,'');
		var id = +(url.match(/(\/[^\/]+)$/)[0].replace(/[^0-9]/,''));
		url = url.replace(/(\/[^\/]+)$/,'/destroy');

		this._socket.emit(url,JSON.stringify({
			id: id
		}),function(result) {
			try {
				var parsedResult = JSON.parse(result);
			}
			catch (e) {
				throw new Error("Server response could not be parsed:",result,e);
			}
			
			// Call success callback if specified
			options && options.success && options.success(parsedResult);
		});
	},
	destroy: function(model,options){
		var url = model.url();
		
		// Remove trailing slash and add /destroy to url
		url = url.replace(/\/*$/,'');
		var id = +(url.match(/(\/[^\/]+)$/)[0].replace(/[^0-9]/,''));
		url = url.replace(/(\/[^\/]+)$/,'/destroy');
		debug.debug("-------DESTROYARRA",url,{
			id:id
		});

		this._socket.emit(url,JSON.stringify({
			id: id
		}),function(result) {
			try {
				var parsedResult = JSON.parse(result);
			}
			catch (e) {
				throw new Error("Server response could not be parsed:",result,e);
			}
			
			// Call success callback if specified
			options && options.success && options.success(parsedResult);
		});
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
		this._socket = this.io && this.io.connect(this.baseurl);
					
		// Map events
		_.each(this.events,function(eventFn,eventName) {
			Mast.Socket._socket.on(eventName,this[eventFn]);
		},this);
					
		this.connected = true;
	}
},Backbone.Events)