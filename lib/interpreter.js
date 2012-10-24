var util = require ('./util');


// Get auth/access control library
var aclMiddleware = require('./acl');



// Interpret a socket.io request to express js semantics
exports.interpret = function (socketIOData,socketIOCallback,socket,app,urlMappings,handleWildcardSocketRequest,processSocketRequest) {
	
	// Build request object
	var req = exports.req = {	
		_socketIOPretender: true,
		method		: (socketIOData.method && _.isString(socketIOData.method) && socketIOData.method.toUpperCase()) || 'GET',
		protocol	: 'ws', // TODO: grab actual protocol from socket.io transport method
		socket		: socket,
		params		: socketIOData.data || {},
		session		: socket.handshake.session,									// Fetch express session object
		param		: function (paramName) {									// Lookup parameter
			return req.params && req.params[paramName];
		},
		headers			: {}
	};
		
	// Build response object
	var res = exports.res = {
		_socketIOPretender: true,
		
		// Send response
		send: function(body) {
			socketIOCallback(body);
		},
		
		// Send json response
		json: function(obj, status){
			var body = JSON.stringify(obj);
			this.charset = this.charset || 'utf-8';
			return this.send(body, status);
		},
		
		// Render a view
		render: function(view, options, fn) {		
			fs.readFile(app.settings.views+"/"+view, "utf-8",function(err, template) {
				if (err) {
					sendError("No such view, "+view+", exists!");
					debug.warn(err);
				}
				else res.send(ejs.render(template,{
					session: req.session,
					title: options && options.title
				}));
			});
		},
		
		// Redirect to a different url
		redirect : function (pathOrStatusCode,path) {
			path = path || pathOrStatusCode;

			// TODO: prevent redirect if response has already been sent
			// (no reason why this is technically required, but it would match up better w/ the HTTP version)
			
			// Determine entity and action from redirect path
			var mockRequest = util.parsePath(path);
			
			// Route mock request
			var hopcount = 0,  route = path;
			while (_.isString(route)) {											// A string means this route is a redirect
				route = urlMappings[route];										// Redirect: attempt to reroute using new string url
				hopcount++;														// In case the user created a redirect loop, hopcount halts execution
				if (hopcount > 10) {
					throw new Error ("Over 1000 redirects detected!  You probably have a redirect loop.  Please check your url mappings.");
				}
			}
			route = route || handleWildcardSocketRequest(mockRequest.entity,mockRequest.actionName);
			
			// Do redirect (run proper controller method)
			return (processSocketRequest(route.controller,route.action))(req,res,app);
		},

		// Make data accessible from all views
		locals: function (data) {
			// TODO
		},

		
		
		// TODO
		contentType		: notSupportedError,
		type			: notSupportedError,
		set				: notSupportedError,
		header			: notSupportedError,
		get				: notSupportedError,
		clearCookie		: notSupportedError,
		signedCookie	: notSupportedError,
		cookie			: notSupportedError
		
	};
	
	return { req: req, res: res };


	// Respond with a message indicating that the feature is not currently supported
	function notSupportedError () {
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

// Set up routing table for socket requests
exports.mapSocketRequests = function(app, io) {

	// Load routing table configuration initially
	var urlMappings = _.extend({},
	// From dedicated route mappings configuration
	path.existsSync(config.appPath + '/routes.js') ? require(config.appPath + '/routes') : {});

	// When a socket.io client connects, listen for the actions in the routing table
	io.sockets.on('connection', function(socket) {
		debug.debug("New socket.io client connected!", socket.id);

		// Prune data from the session to avoid sharing anything inadvertently
		// By default, very restrictive
		var pruneFn = config.sessionPruneFn ||
		function(session) {
			return {};
		};

		// Respond w/ information about session
		socket.emit('sessionUpdated', pruneFn(socket.handshake.session));

		// Map routes
		socket.on('message', function(socketReq, fn) {
			socketReq = JSON.parse(socketReq); // Parse request as JSON
			var path = socketReq.url;

			// Split url and determine controller/action
			var entityAction = util.parsePath(path);
			// Add controller & action to request data
			socketReq = _.extend(entityAction, socketReq);
			var route = urlMappings[path];
			var hopcount = 0;
			while(_.isString(route)) { // A string means this route is a redirect
				route = urlMappings[route]; // Redirect: attempt to reroute using new string url
				hopcount++; // In case the user created a redirect loop, hopcount halts execution
				if(hopcount > 100) {
					throw new Error("Over 1000 redirects detected!  You probably have a redirect loop.  Please check your url mappings.");
				}
			}

			// Generate express context
			var expressContext = socketInterpreter.interpret(socketReq, fn, socket, app, urlMappings, handleWildcardSocketRequest, processSocketRequest);
			route = route || handleWildcardSocketRequest(socketReq.entity, socketReq.actionName);
			return(processSocketRequest(route.controller, route.action))(expressContext.req, expressContext.res, app);
		});
	});
};


function processSocketRequest(controllerName, actionName) {
	return function(req, res, app) {
		enhanceRequest(req, res, controllerName, actionName);
		req.xhr = req.isAjax = false;
		// Mark this as a socket.io request, not XHR (even if it is)
		req.isSocket = true;
		// Save controller and action to req.params
		req.params.action = actionName;
		req.params.controller = controllerName;

		// TODO: Run parameter validation middleware
		// Run ACL middleware
		aclMiddleware.enforce(controllerName, actionName, req, res, function() {
			var scaffoldedController = require('./scaffolds/controller').definition(controllerName);
			var controller = sails.controllers[controllerName] || {};

			// Provide scaffolded actions where this controller is missing them
			controller = _.extend(controller, scaffoldedController);

			// Respond w/ 404 if action does not exist
			if (!controller || !(controller && controller[actionName])) {
				res.json({
					status: 404,
					success: false
				});
			}
			else {
				(_.bind(controller[actionName], controller))(req, res);
			}
		});
	};
}



function handleWildcardSocketRequest(entity, actionName) {

	// Map route to action
	if(_.contains(_.keys(sails.controllers), entity)) {
		var controller = sails.controllers[entity];

		// If action is unspecified, and this is a GET, default to index, otherwise default to Backbone semantics
		// If index is unspecified, always default to Backbone semantics
		actionName = actionName || controller['index'];

		// If action doesn't match, try a conventional synonym
		if(!controller[actionName]) {
			actionName = crudSynonyms[actionName] || actionName;
		}

		// If the action matches now, 
		if(controller[actionName]) {
			return {
				controller: entity,
				action: actionName
			};
		}
	} else {
		// No controller by that entity name exists
	}

	// If that fails, but this is a CRUD or index action, 
	// and the controller name matches an existing model, use the scaffold
	if(isCrudOrIndexAction(actionName) && entityMatchesExistingModel(entity)) {
		actionName = crudSynonyms[actionName] || actionName || "index";
		return {
			controller: entity,
			action: actionName
		};
	}

	return {
		controller: entity,
		action: actionName
	};
}