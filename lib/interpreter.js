// Load routes config
var urlMappings = _.extend({}, path.existsSync(config.appPath + '/routes.js') ? require(config.appPath + '/routes') : {});

var util = require('./util');
var router = require('./router');

// Get auth/access control library
var aclMiddleware = require('./acl');

exports.route = function(socketReq, fn, socket) {
	try {
		// Parse request as JSON
		socketReq = JSON.parse(socketReq);

	} catch(e) {
		throw new Error("Invalid Socket request.");
		// TODO: Respond with json that this was an invalid request
		// socketReq = {success: false, error: "Invalid Socket request."};
	}

	// Parse url for entity and action using routing table if possible
	var entityAction = router.parseMappedUrl(socketReq.url);

	// If url is in routes table, explicitly define mapped route to entityAction
	var handlerFn;
	if(entityAction && _.isObject(entityAction)) {
		socketReq = _.extend(socketReq, entityAction);
		handlerFn = router.handleRequest(entityAction);
	} else {
		handlerFn = router.handleRequest();
	}

	// Simulate Express/Connect request context
	var expressContext = exports.interpret(socketReq, fn, socket);

	// Call handler action using the simulated express context
	handlerFn(expressContext.req, expressContext.res, expressContext.next);
};

// Interpret a socket.io request to express js semantics
exports.interpret = function(socketIOData, socketIOCallback, socket) { 
	
	// Build request object
	var req = exports.req = {
		_socketIOPretender: true,
		isSocket: true,
		method: (socketIOData.method && _.isString(socketIOData.method) && socketIOData.method.toUpperCase()) || 'GET',
		protocol: 'ws',
		port: config.port,
		// TODO: grab actual protocol from socket.io transport method
		socket: socket,
		params: _.extend(util.parsePath(socketIOData.url),socketIOData.data),
		session: socket.handshake.session,
		// Fetch express session object
		param: function(paramName) { // Lookup parameter
			return req.params && req.params[paramName];
		},
		headers: {
			host: config.host
		},
		header: function(attrName,value) {
			return this.headers[attrName];
		},
		host: function () {
			return this.headers[host];
		}
	};

	// Build response object
	var res = exports.res = {
		_socketIOPretender: true,

		// Send response
		send: function(body) {
			socketIOCallback(body);
		},

		// Send json response
		json: function(obj, status) {
			var body = JSON.stringify(obj);
			this.charset = this.charset || 'utf-8';
			return this.send(body, status);
		},

		// Render a view
		render: function(view, options, fn) {
			// Default template file extension
			// TODO: pull this from express config 
			// (look at implications w/ express 3.x)
			var ext = ".ejs";

			// If a file extension is specified
			if(_.fileExtension(view) !== "") {
				// Read the file directly
				readView(view, function(err, result) {
					if(err) {
						sendError("No such view, " + view + ", exists!  Tried: " + view);
						debug.warn(err);
					} else renderView(result);
				});
			}
			// Otherwise try reading the view by a few different filenames
			else {
				// Start by trying the filename with the default extension
				// TODO: Support things other than ejs
				readView(view + ".js", function(err, result) {
					err ? readView(view + ext, function(err, result) {
						err ? readView(view + "/index.js", function(err, result) {
							err ? readView(view + "/index" + ext, function(err, result) {
								if(err) {
									sendError("No such view, " + view + ", exists!  Tried: " + view + ", " + view + "" + ext + ", " + view + ".js," + view + "/index.js, and " + view + "/index" + ext);
									debug.warn(err);
								} else renderView(result);
							}) : renderView(result);
						}) : renderView(result);
					}) : renderView(result);
				});
			}

			// Read the specified view
			function readView(filename, cb) {
				fs.readFile(app.settings.views + "/" + filename, "utf-8", cb);
			}

			// Render the specified view
			function renderView(template) {
				res.send(ejs.render(template, _.extend({
					session: req.session
				}, options)));
			}
		},

		// Redirect to a different url
		redirect: function(pathOrStatusCode, path) {
			path = path || pathOrStatusCode;

			// TODO: prevent redirect if response has already been sent
			// (no reason why this is technically required, but it would match up better w/ the HTTP version)
			// Determine entity and action from redirect path
			var mockRequest = util.parsePath(path);

			// Do redirect (run proper controller method)
			return exports.route(mockRequest, socketIOCallback, socket);

			// var hopcount = 0,
			// 	route = path;
			// while(_.isString(route)) { // A string means this route is a redirect
			// 	route = urlMappings[route]; // Redirect: attempt to reroute using new string url
			// 	hopcount++; // In case the user created a redirect loop, hopcount halts execution
			// 	if(hopcount > 10) {
			// 		throw new Error("Over 1000 redirects detected!  You probably have a redirect loop.  Please check your url mappings.");
			// 	}
			// }
			// route = route || handleWildcardSocketRequest(mockRequest.entity, mockRequest.actionName);
			// // Do redirect (run proper controller method)
			// return(processSocketRequest(route.controller, route.action))(req, res, app);
		},

		// Scoped variables accesible from views
		viewData: {},
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

	};

	return {
		req: req,
		res: res
	};


	// Respond with a message indicating that the feature is not currently supported

	function notSupportedError() {
		return sendError("Not currently supported!");
	}

	// Respond with an error message

	function sendError(errmsg) {
		debug.warn(errmsg);
		res.json({
			error: errmsg,
			success: false
		});
	}
}


//	////// TODO ////////////////////////////
//	res.contentType =
//	res.type = function(type){
//		return this.set('Content-Type', ~type.indexOf('/')
//			? type
//			: mime.lookup(type));
//	};
//	
//	
//	////// TODO ////////////////////////////
//	res.set = 
//	res.header = function(field, val){
//		return sendError("Not currently supported!");
//		if (2 == arguments.length) {
//			this.setHeader(field, val);
//		} else {
//			for (var key in field) {
//				this.setHeader(key, field[key]);
//			}
//		}
//		return this;
//	};
//
//	////// TODO ////////////////////////////
//	res.get = function(field){
//		return sendError("Not currently supported!");
//		return this.getHeader(field);
//	};
//
//
//	////// TODO ////////////////////////////
//	// Clear a cookie
//	res.clearCookie = function(name, options){
//		return sendError("Not currently supported!");
//		var opts = {
//			expires: new Date(1), 
//			path: '/'
//		};
//		return this.cookie(name, '', options
//			? utils.merge(opts, options)
//			: opts);
//	};
//	
//	////// TODO ////////////////////////////
//	// Set a signed cookie
//	res.signedCookie = function(name, val, options){
//		return sendError("Not currently supported!");
//		var secret = this.req.secret;
//		if (!secret) throw new Error('connect.cookieParser("secret") required for signed cookies');
//		if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
//		val = utils.sign(val, secret);
//		return this.cookie(name, val, options);
//	};
//
//	////// TODO ////////////////////////////
//	// Set cookie
//	res.cookie = function(name, val, options){
//		return sendError("Not currently supported!");
//		options = options || {};
//		if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
//		if ('maxAge' in options) options.expires = new Date(Date.now() + options.maxAge);
//		if (null == options.path) options.path = '/';
//		var cookie = utils.serializeCookie(name, val, options);
//		this.set('Set-Cookie', cookie);
//		return this;
//	};
//
//	////// TODO ////////////////////////////
//	// Redirect to a different URL
//	res.redirect = function(url){
//		// TODO: retry the routing table with the given url
//		return sendError("res.redirect() not currently supported from a socket.io client!\nDoing nothing!");
//	};