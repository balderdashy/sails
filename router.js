// Instantiate all controller modules
var controllers = {},
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
console.log(controllers);


// Custom mappings for specific urls
var mappingConfig = require('./config/mappings'),
	userMappings = mappingConfig.customMappings();


// Default handling for 500, 404, home page, etc.
var defaultMappings = mappingConfig.defaultMappings();


// Intersect default mappings with user mappings
var urlMappings = _.extend(defaultMappings,userMappings);

// Set up routing table
exports.mapUrls = function mapUrls (app) {
	
	
	// Map standard AJAX and REST routes
	for (var path in urlMappings) {
		var route = urlMappings[path],
			controller,
			action;
		
		// A string means this route is a redirect
		if (_.isString(route)) {
			// Map route
			app.all(path, (function (redirectRoute) {
				return function (req,res,next) { 
					// Prevent redirect loops by refusing to redirect from 403 anywhere else
					console.log("Redirecting to "+redirectRoute+" from " + req.url+ "...");
					res.redirect(redirectRoute);
				}
			})(route));
		}
		else {
			// An object means this route route maps directly to a controller
			controller = controllers[route.controller];
			action = controller[route.action];	
			
			// Map route
			app.all(path, (function (controllerName,actionName) {
				return function (req,res,next) {
//					console.log("\nCONTROLLER\n"+controllerName,"\nACTION\n"+actionName);
					accessControlMiddleware(controllerName,actionName,req,res,next);
				}
			})(controller.id,route.action), action);
		}
		
	}
	
	
	// TODO: When a socket.io client connects, listen for the actions in the routing table
//	io.sockets.on('connection', newWebsocketClientConnects);
	
	
	// Handle wildcard
	app.all('/:entity/:action?/:id?', function (req,res,next) {
			accessControlMiddleware(req.param('entity'),req.param('action'),req,res,next);
		}, handleWildcardRequest);
}




/**
 * Try to match up an arbitrary request with a controller and action
 */
function handleWildcardRequest (req,res,next) {
	
	var entity = req.param('entity'),
	action = req.param('action'),
	method = req.method;

	if (entity && 
		
		// TODO: get smarter about how static assets are served, 
		// this should be customizable
		entity != "stylesheets" && 
		entity != "lib" && 
		entity != "sources" && 
		entity != "images") {

		// Map route to action
		if (_.contains(_.keys(controllers),entity)) {
			var controller = controllers[entity];

			// If action is unspecified, default to index			
			// If index is unspecified, default to Backbone semantics
			action = action || (
				(controller['index']) ? "index" :
				(method=="GET") ? "fetch" :
				(method=="POST") ? "create" :
				action
				);
					
			// If action doesn't match, try a conventional synonym
			if (! controller[action]) {
				action = 
				(action == "delete") ? "remove" :
				(action == "destroy") ? "remove" : 

				(action == "edit") ? "update" : 
				(action == "modify") ? "update" : 

				(action == "view") ? "read" : 
				(action == "show") ? "read" : 
				(action == "detail") ? "read" : 

				(action == "add") ? "create" : 
				(action == "new") ? "create" : 
				action;					
				
				// Attempt to parse resource id from parameters
				if (!_.isNaN(+action)) {
					req.params.id = +action;
					
					// Default to Backbone semantics
					action = (
						(method == "PUT") ? "update" :
						(method == "DELETE") ? "remove" :
						action);
				}
				
				// Decide on best guess for action name
				req.params.action = action;
			}

			// If the action matches now, 
			if (controller[action]) {
				method = controller[action];
				return method(req,res,next);
			}
		}
		else {
			// No controller by that entity name exists
		}

		// If that fails, just display the 404 page
		return controllers.meta.notfound(req,res,next);
	}
	else {
		next();
	}
	
}




// Convert a socket.io client event callback to ExpressJS request semantics
function socketIOToExpress (handler) {	
	var req = {},
		res = {
			handler: handler
		},
		next = function (){};
	
	// TODO: ACTUALLY GET A HOLD OF THE REQ/RES OBJECTS HERE
	// or, alternatively, wrap every controller method in proprietary crd
	// 
	
	handler(req,res,next);
}


// Called when a new socket.io client connects to the server
function newWebsocketClientConnects (socket) {
	// Map socket.io routes
	for (var path in urlMappings) {
		
		// TODO: Auth
		
		
		console.log("MAPPED " + path + " to " + urlMappings[path]);
		
		// Map route using emulated express request
//		socket.on(path, socketIOToExpress(urlMappings[path]));
	}
}


// Load user access control configuration file
var permissionConfig = require('./config/permissions'),
	acTree = permissionConfig.acTree();

// Route incoming requests based on credentials
function accessControlMiddleware (controllerName,actionName,req,res,next) {
	
	// The routing directions
	var routePlan;
	
	// Traverse access control tree to determine where to route this request
	var controller = acTree[controllerName]
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
		routePlan = !_.isUndefined(acTree['*']) ? acTree['*'] : true;
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
		res.redirect('/403');
	}
	// if the routePlan is a function, treat it as basic middleware
	else if (_.isFunction(routePlan)) {
		routePlan(req,res,next);
	}
	
	// TODO: Role-aware route plans ("user", "admin", ["user","editor"], etc.)
	
	// TODO: complex condition routePlan objects
}


// TODO: Build role dictionary

// Get permission tree
//var permissionTree = permissionConfig.permissionTree(AuthenticationService);
// Default to no security (TODO: configurable)
//var defaultAuthMiddleware = controllers.auth.none;

//// TODO: traverse permission tree and build middleware for the requested action
//function buildAuthMiddleware (route) {
//	
//	console.log("Building authentication middleware for route:",route)
//	
//	// TODO: Traverse permission tree using controller and action from route
////	permissionTree[route.controller];
//	
//	return function (req,res,next) {
//		next();
//	}
//}