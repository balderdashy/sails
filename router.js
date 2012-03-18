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
	controllers[className] = controller;
});



// Custom mappings for specific urls
var mappingConfig = require('./config/mappings'),
	userMappings = mappingConfig.customMappings(controllers);
	
// TODO: Build role dictionary

// TODO: Build permission tree
var authMappings = mappingConfig.authMappings(controllers);

// Default to no security (TODO: configurable)
var defaultAuthMiddleware = controllers.auth.none;


// Default handling for 500, 404, home page, etc.
var defaultMappings = {
	'/': controllers.meta.home, 
	'/500': controllers.meta.error, 
	'/404': controllers.meta.notfound
}


// Intersect default mappings with user mappings
var urlMappings = _.extend(defaultMappings,userMappings);



// Set up routing table
exports.mapUrls = function mapUrls (app) {
	
	
	// Map standard AJAX and REST routes
	for (var path in urlMappings) {
		
		var authMiddleware = authMappings[path] || defaultAuthMiddleware,
			action = urlMappings[path];
		
		// Map route
		app.all(path, authMiddleware, action);
	}
	
	
	// When a socket.io client connects, listen for the actions in the routing table
	io.sockets.on('connection', newWebsocketClientConnects);
	
	
	// Handle wildcard
	app.all('/:entity/:action?/:id?', handleWildcardRequest);
}



// Convert a socket.io client event callback to ExpressJS request semantics
function socketIOToExpress (handler) {	
	var req = {},
		res = {
			handler: handler
		},
		next = function (){};
	console.log("!!!!!!!!!!",handler);
	
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
		socket.on(path, socketIOToExpress(urlMappings[path]));
	}
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

		// If that fails, just display the 404 page
		return controllers.meta.notfound(req,res,next);
	}
	else {
		next();
	}
}