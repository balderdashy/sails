// Instantiate all controller modules
controllers = {},
	controllerFiles = require('require-all')({ 
		dirname: __dirname + '/controllers',
		filter: /(.+Controller)\.js$/
	});
_.each(controllerFiles,function (controller, filename) {
	// If no 'id' attribute was provided, take a guess based on the filename
	var className = controller.id || filename.replace(/Controller/, "");
	className = className.toLowerCase();
	if (!controller.id) {
		controller.id = className;
	}
	
	controllers[className] = controller;
	
});


// Custom mappings for specific urls
var mappingConfig = require('./config/mappings'),
userMappings = mappingConfig.customMappings();


// Default handling for 500, 404, home page, etc.
var defaultMappings = mappingConfig.defaultMappings();

// Intersect default mappings with user mappings
var urlMappings = _.extend(defaultMappings,userMappings);




// Set up routing table for socket requests
exports.mapSocketRequests = function (app,io) {
	// When a socket.io client connects, listen for the actions in the routing table
	io.sockets.on('connection', function(socket) {
		debug.debug("New socket.io client connected!");
	
		// Map socket.io routes
		for (var path in urlMappings) {
		
			var route = urlMappings[path],
				controller, action;
		
		
			// A string means this route is a redirect
			var hopcount = 0;
			while (_.isString(route)) {
				
				// redirect to actual route
				route = urlMappings[route];
				
				// In case the user created a redirect loop, hopcount halts execution
				hopcount++;
				if (hopcount > 1000) {
					throw new Error ("Over 1000 string redirects in URL mapping!  You probably have a redirect loop.  Please check your url mappings.");
				}
			}
		
			// At this point, we can assume this route is an object,
			// so this route route maps directly to a controller
				
			// Emulate express semantics and handle request
			socket.on(path,translateSocketRequest(socket,route.controller, route.action,
				function(controllerName,actionName,req,res) {
					res.app = app;
					(controllers[controllerName][actionName])(req,res);
				}));


		//				// Invoke access control middleware
		//				var authMiddleware = function(req,res,next) {accessControlMiddleware(route.controller,route.action,req,res,next);}
		//
		//
		//				// Build virtual express route
		//				// TODO
		//				// Combine action and auth middleware
		//	//			middleware(emulatedExpressContext.req,emulatedExpressContext.res,emulatedExpressContext.next)
		//				var virtualRoute = function(req,res,next){};
		//
		//				// Assign socket event handler
		//				socket.on(path, virtualRoute);
		}


		
		
		// TODO: Map wildcard routes
		socket.on("*",translateSocketRequest(socket,null,null,
			function(controllerName,actionName,req,res) {
				res.app = app;
				var r = handleWildcardRequest(req,res);
				(controllers[r.controller][r.action])(req,res);
			}));
	});
}


// Set up routing table for standard http(s) requests
exports.mapExpressRequests = function mapExpressRequests (app) {
	
	// Map standard AJAX and REST routes
	for (var path in urlMappings) {
		var route = urlMappings[path],
		controller, action;
		
		// A string means this route is a redirect
		if (_.isString(route)) {
			
			// Map route
			app.all(path,(function (redirectRoute) {
				return function (req,res,next) { 
					debug.debug("Redirecting to "+redirectRoute+" from " + req.url+ "...");
					res.redirect(redirectRoute);
				}
			})(route));
		}
		
		// An object means this route route maps directly to a controller
		else {
			controller = controllers[route.controller];
			action = controller[route.action];	
			
			// Map route
			app.all(path,translateExpressRequest(controller.id,route.action));
		}
	}

	// Handle all other cases (wildcard)
	app.all('/:entity/:action?/:id?', generateExpressWildcardHandler());
}




// Convert a socket.io client event callback to Sails' request semantics
var socketInterpreter = require("./lib/interpreter");
function translateSocketRequest (sock,controllerName,actionName,callback) {		
	return function(data,fn){
		var req={},
		res=socketInterpreter.res;
		res.send = function(body) {
			fn(body);
		}
		callback(controllerName, actionName,req,res);
	}
}





/**
 * Return a request handler for the given wildcard route
 */
function generateExpressWildcardHandler() {
	return function(req,res,next) {
		var route = handleWildcardRequest(req,res,next);
		return (translateExpressRequest(route.controller,route.action))(req,res,next);
	};
}






// Convert an ExpressJS request to Sails' request semantics
// and render response
function translateExpressRequest (controllerName,actionName) {
	return function (req,res,next) {
		
		// Generate and bind request context
		this.controller = controllerName;
		this.action = actionName;
	
		res.e_render = res.render;
		res.render=function(path,data){
			data = data || {};
		
			// If no path provided, get default
			if (!path) {
				path = controllerName+"/"+actionName;
			}
			// If view path was provided, use it
			else if (_.isString(path)) { }
			else {
				// If a map of data is provided as the first argument, use it
				data = (_.isObject(path)) ? path : data;
			}
		
			// Set view data
			res.locals(data);
		
			// Template and render view
			debug.debug("Rendering view:",path);
			res.e_render(path);
		}

		// Always share some data with views
		res.locals({
			Session: req.session,
			title: config.appName + " | " + actionName.toCapitalized()
		});

		// Run auth middleware
		accessControlMiddleware(this.controller,this.action,req,res,function() {
			
			// Validate parameters
			// TODO
			// parameterMiddleware(req,res,function() {
			// 
			// });
		
			// Excute action in request context
			//	console.log("BINDING: controllers[controllerName][actionName]: ",controllers[controllerName][actionName],controllerName,actionName,controllers);
			controllers[controllerName][actionName](req,res);
		});
	}
}


/**
 * Use resourceful routing when the route is not explicitly defined
 * (tries to match up an arbitrary request with a controller and action)
 * (also supports backbone semantics)
 */
function handleWildcardRequest (req,res,next) {
	
	var entity = req.param('entity'),
	actionName = req.param('action'),
	method = req.method;
		
	// Map route to action
	if (_.contains(_.keys(controllers),entity)) {
		var controller = controllers[entity];

		// If action is unspecified, default to index			
		// If index is unspecified, default to Backbone semantics
		actionName = actionName || (
			(controller['index']) ? "index" :
			(method=="GET") ? "fetch" :
			(method=="POST") ? "create" :
			actionName
			);

		// If action doesn't match, try a conventional synonym
		if (! controller[actionName]) {
			actionName = 
			(actionName == "delete") ? "remove" :
			(actionName == "destroy") ? "remove" : 

			(actionName == "edit") ? "update" : 
			(actionName == "modify") ? "update" : 

			(actionName == "view") ? "read" : 
			(actionName == "show") ? "read" : 
			(actionName == "detail") ? "read" : 

			(actionName == "add") ? "create" : 
			(actionName == "new") ? "create" : 
			actionName;					

			// Attempt to parse resource id from parameters
			if (!_.isNaN(+actionName)) {
				req.params.id = +actionName;
				

				// Default to Backbone semantics
				actionName = (
					(method == "PUT") ? "update" :
					(method == "DELETE") ? "remove" :
					actionName);
			}
				
			req.params.action = actionName;
		}

		// If the action matches now, 
		if (controller[actionName]) {
			req.params.action = actionName;
			return {
				controller: entity,
				action: actionName
			};
		}
	}
	else {
	// No controller by that entity name exists
	}

	// If that fails, just display the 404 page
	return {
		controller: "meta",
		action: "notfound"
	};
}






// Load user access control configuration file
var permissionConfig = require('./config/permissions'),
accessControlTree = _.extend(permissionConfig.defaultAccessControlTree(), permissionConfig.accessControlTree());

// Route incoming requests based on credentials
function accessControlMiddleware (controllerName,actionName,req,res,next) {
	
	// The routing directions
	var routePlan;
	
	// Traverse access control tree to determine where to route this request
	var controller = accessControlTree[controllerName]
	if (controller && (!_.isUndefined(controller[actionName]) || !_.isUndefined(controller['*']))) {
		var action = controller[actionName]
		if (!_.isUndefined(action)) {
			
			// Use action route plan
			routePlan = action; 
		}
		else {
			// Use controller default
			routePlan = controller['*'];
		}
	}
	else {
		// Use app default
		routePlan = !_.isUndefined(accessControlTree['*']) ? accessControlTree['*'] : true;
	}
	
	// Rereoute if necessary (exit middleware)
	reroute(routePlan,req,res,next);
}


// Reroute as a result of access control
function reroute (routePlan,req,res,next) {
	// If routePlan is boolean, allow or deny from all accordingly
	if (routePlan === true) {
		next();
	}
	// Prevent redirect loops by always setting access to '/403' to true
	else if (req.url === '/403') {
		next();
	}
	else if (routePlan === false) {
		res.render('403',{
			title:'Access Denied'
		});
	}
	// if the routePlan is a function, treat it as basic middleware
	else if (_.isFunction(routePlan)) {
		routePlan(req,res,next);
	}
	
// TODO: Role-aware route plans ("user", "admin", ["user","editor"], etc.)
	
// TODO: complex condition routePlan objects
}




// TODO: support scope injection in controller code
// 
//function Context(controllerName,actionName,req,res,next) {
//	this.controller = controllerName;
//	this.action = actionName;
//	
//	this.render=function(path,data){
//		data = data || {};
//		
//		// If no path provided, get default
//		if (!path) {
//			path = controllerName+"/"+actionName;
//		}
//		// If view path was provided, use it
//		else if (_.isString(path)) { }
//		else {
//			// If a map of data is provided as the first argument, use it
//			data = (_.isObject(path)) ? path : data;
//		}
//		
//		// Set view data
//		res.locals(data);
//		
//		// Template and render view
//		debug.debug("Rendering view:",path);
//		res.render(path);
//	}
//	
//	this.redirect=function(){
//
//	}
//	this.json=function(){
//
//	}
//	this.req=req;
//	this.res=res;
//	this.next=next;
//	
//	/**
//	* Preprocessing and controller code is executed from the context of an object 
//	* in the request (for express, this == req.context)
//	*/	
//	// Share session object with views
//	res.locals({
//		Session: req.session,
//		title: config.appName + " | " + actionName.toCapitalized()
//	});
//
//	// Run auth middleware
//	accessControlMiddleware(this.controller,this.action,req,res,next);
//
//	// Validate parameters
//	// TODO
//
//	// Do action from the present context
//	//	console.log(this);
//	
//	
//	// Excute action in request context
//	//	console.log("BINDING: controllers[controllerName][actionName]: ",controllers[controllerName][actionName],controllerName,actionName,controllers);
//	var exec=_.bind(controllers[controllerName][actionName],this);
//	exec();
//}