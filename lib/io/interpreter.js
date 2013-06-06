// interpreter.js
// --------------------
//
// Manages the parroting of Express HTTP requests for Socket.io
// Mimics request and response objects using a required socket.io message format

// Load routes config
var _ = require('lodash');
var Router = require('../router');


// Set readable and writable in constructor.
// Inherit from base stream class.
var ResStream = function() {
	this.writable = true;
};
require('util').inherits(ResStream, require('stream'));

// Extract args to `write` and emit as `data` event.
// Optional callback
ResStream.prototype.write = function(str) {
	// Fire 'data' event on socket
	this.socket.emit('data', str);
};

// If err set, emit `error`, otherwise emit `end` event.
// Optional callback
ResStream.prototype.end = function(err) {
	if (err) {
		this.emit('error', err);
		this.socket.emit('error', err);
	}
	else this.socket.emit('end');
};

// Get auth/access control library
exports.route = function(socketReq, fn, socket) {
	// Parse request as JSON
	try {
		socketReq = JSON.parse(socketReq);
	} catch(e) {
		var msg = 'Invalid socket request! The following JSON could not be parsed :: '+socketReq;
		if (fn) return fn(msg);
		else return sails.log.error(msg);
	}

	if (!socketReq.url) {
		var msg = 'No url provided in request: '+socketReq;
		if (fn) return fn(msg);
		else return sails.log.error(msg);
	}


	// Parse url for entity and action using routing table if possible
	var entityAction = Router.fetchRoute(socketReq.url,getVerb(socketReq));

	// If url is in routes table, explicitly define mapped route to entityAction
	var handlerFn;
	if(entityAction && _.isObject(entityAction)) {
		socketReq = _.extend(socketReq, entityAction);
		handlerFn = Router.handleRequest(entityAction);
	} else {
		handlerFn = Router.handleRequest();
	}

	// Retrieve session data from store
	var sessionKey = socket.handshake.sessionID;

	require('../session/get')(sessionKey, function (err, sessionData) {

		// Simulate Express/Connect request context
		var expressContext = exports.interpret(socketReq, fn, socket);

		if (err) {
			sails.log.error('Error retrieving session: ' + err);
			return fn('Error retrieving session: ' + err);
		}

		// Create session for first time if necessary
		if (!_.isObject(sessionData)) {
			sessionData = {
				cookie: { path: '/', httpOnly: true, maxAge: null }
			};
			sails.log.verbose('Saving session for first time:');
			// sails.log.error(err);
			// return fn('No session data returned, and an error was encountered saving session data for the first time: ' + err);
		}
		// Otherwise session exists and everything is ok.
		

		// Add method to trigger a save() of the session data
		function SocketIOSession () {
			this.save = function (cb) {
				require('../session/set')(sessionKey, expressContext.req.session, function (err) {
					if (err) {
						sails.log.error('Error encountered saving session:');
						sails.log.error(err);
					}
					if (cb) cb(err);
				});
			};
		}

		// Instantiate SocketIOSession
		expressContext.req.session = new SocketIOSession();

		// Provide access to session data in req.session
		_.extend(expressContext.req.session, sessionData);

		// Call handler action using the simulated express context
		handlerFn(expressContext.req, expressContext.res, function () {

			// Call next middleware
			_.isFunction(expressContext.next) && expressContext.next();
		});
	});
};

// Interpret a socket.io request to express js semantics
exports.interpret = function(socketIOData, socketIOCallback, socket) {

	// Build request object
	var req = exports.req = {
		_socketIOPretender: true,
		isSocket: true,
		method: getVerb(socketIOData),
		protocol: 'ws',
		port: sails.config.port,
		// TODO: grab actual protocol from socket.io transport method
		socket: socket,
		params: _.extend(sails.util.parsePath(socketIOData.url),socketIOData.data),

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
		_socketIOPretender: true,

		socket: socket,

		// Send response
		send: function(body, status) {
			// (session is saved automatically when responding)
			req.session.save(function (err) {
				socketIOCallback(body);
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
				return exports.route(mockRequest, socketIOCallback, socket);
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


		// TODO
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
		return sendError('Not currently supported!');
	}

	// Respond with an error message
	function sendError(errmsg) {
		sails.log.warn(errmsg);
		res.json({
			error: errmsg,
			success: false
		});
	}
};

// Get simulated HTTP verb for a given request object
function getVerb(socketIOData) {
	return (socketIOData.method && _.isString(socketIOData.method) && socketIOData.method.toUpperCase()) || 'GET';
}
