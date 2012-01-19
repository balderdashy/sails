
/**
 * Set up backbone.sync to work with socket.io
 * Call this function when socket.io is ready
 */
function setupBackboneSyncForSocketIo () {

	// https://gist.github.com/1187630/d43375d9acf837e3b26a14eef19aa9ebd43f9938
	// replace window.io with your socket.io connection object
	// TODO: better error handling

Backbone.sync = function (method, model, options) {

		var getUrl = function (object) {
			if (!(object && object.url)) return null;
			return _.isFunction(object.url) ? object.url() : object.url;
		};

		var entity = getUrl(model);
//		var cmd = getUrl(model).split('/'),
//				namespace = cmd[0];
//
		// Backup attached data before replacing it with the model
		// TODO: do something with the backup
		options.attachedData = options.data;

		var params = _.extend({
			req: method
		}, options);

		params.data = model.toJSON() || {};
		Socket.emit(entity+":"+method, params.data, function (data) {
			options.success(data);
		});
//		Socket.socket.emit(namespace + ':' + method, params.data, function (data) {
//			options.success(data);
//		});
	};

}