
// Load routes config
var _ = require('lodash');
var Router = require('../../router');
var ResStream = require('./ResStream');

module.exports = interpret;

// Interpret an incoming socket.io message to Express semantics
// Mock request and response objects
function interpret (socketIOData, socketIOCallback, socket, messageName) {

	// Build request object
	var req = exports.req = {
		isSocket: true,
		method: require('./getVerb')(socketIOData, messageName),
		protocol: 'ws',
		port: sails.config.port,
		// TODO: grab actual protocol from socket.io transport method
		socket: socket,
		params: _.extend(sails.util.parsePath(socketIOData.url),socketIOData.data, socketIOData.params),

		// Lookup parameter
		param: function(paramName) {
			return req.params && req.params[paramName];
		},
		headers: {
			// TODO: pass host down with socket request
			host: sails.config.host
		},
		header: function(attrName,value) {
			return this.headers[attrName];
		},

		// Listen to broadcasts from a room
		listen: function (room) {
			return this.socket.join(room);
		}
	};

	// Provide easy access to host (Express 3.x)
	req.host = req.headers['host'];

	// Build response object as stream
	var res = exports.res = _.extend(new ResStream(), {

		socket: socket,

		// Send response
		send: function(body, status) {
			// (session is saved automatically when responding)
			req.session.save(function (err) {
				if (!socketIOCallback) {
					sails.log.error('Unable to respond over socket: No callback specified.');
				}
				else socketIOCallback(body);
			});
		},

		// Publish some data to a model or collection
		broadcast: function (room,uri,data) {
			req.socket.broadcast.to(room).json.send({
				uri: uri,
				data: data
			});
		},

		// Send json response
		json: function(obj, status) {
			var body = JSON.stringify(obj);
			this.charset = this.charset || 'utf-8';
			return this.send(body, status);
		},

		// Render a view
		render: function(view, options, fn) {
			return sendError('Sails refusing to render view over socket.  Is that really what you wanted?');
		},

		// Redirect to a different url
		// NOTE! Redirect is not prevented if response has already been sent
		// (no reason why this is technically required, but worth noting that this is different than the HTTP version)
		redirect: function(pathOrStatusCode, path) {
			// (session is saved automatically when redirecting)
			req.session.save(function (err) {

				path = path || pathOrStatusCode;

				// Determine entity and action from redirect path
				var mockRequest = sails.util.parsePath(path);

				// Do redirect (run proper controller method)
				return require('./route')(mockRequest, socketIOCallback, socket, 'get');
			});
		},

		// Scoped variables accesible from views
		viewData: {
			// TODO: do true implementation of view partials
			partial: function () {}
		},
		locals: function(newLocals) {
			res.viewData = _.extend(res.viewData, newLocals);
		},

		local: function(attrName, value) {
			res.viewData[attrName] = value;
		},


		contentType: notSupportedError,
		type: notSupportedError,
		header: notSupportedError,
		set: notSupportedError,
		get: notSupportedError,
		clearCookie: notSupportedError,
		signedCookie: notSupportedError,
		cookie: notSupportedError
	});

	// Aliases
	req.subscribe = req.listen;
	res.publish = res.broadcast;

	return {
		req: req,
		res: res
	};


	// Respond with a message indicating that the feature is not currently supported
	function notSupportedError() {
		return sendError('That method is not available over socket.io!');
	}

	// Respond with an error message
	function sendError(errmsg) {
		sails.log.warn(errmsg);
		res.json({
			error: errmsg,
			success: false
		});
	}
}
