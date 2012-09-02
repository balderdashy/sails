var socketInterpreter = require("./interpreter");

// Instantiate all controller modules
controllers = {},
	controllerFiles = require('require-all')({ 
		dirname: config.appPath + '/controllers',
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

// If no MetaController was provided, use the default
//if (!controllers['meta']) {
//	controllers['meta'] = require(__dirname + '/default/controllers/MetaController');
//	
//	// if suitable views don't exist in the expected places, create them
//	
//}




// Default route mappings
var urlMappings = {
                '/': {controller:'meta',action:'home'},
                '/500': {controller:'meta',action:'error'}, 
                '/404': {controller:'meta',action:'notfound'},
                '/403': {controller:'meta',action:'denied'}
        };
		
// Extend mappings from main file
urlMappings = _.extend(urlMappings,config.urlMappings || {});

// Extend mappings from config directory (legacy method)
if (path.existsSync(config.appPath+'/config/mappings.js') ) {
	urlMappings = _.extend(urlMappings,require(config.appPath+'/config/mappings').customMappings());
}


// Enable rigging if specified
var viewMiddleware = [];
if (config.rigging) {
	viewMiddleware.push(config._riggingLib.middleware);
}

// Enable other view middleware for use in sails modules
if (config.viewMiddleware) {
	viewMiddleware.concat(config.viewMiddleware);
}




// Set up routing table for socket requests
exports.mapSocketRequests = function (app,io) {
	// When a socket.io client connects, listen for the actions in the routing table
	io.sockets.on('connection', function(socket) {
		debug.debug("New socket.io client connected!");
			
		// Map routes
		socket.on('message', function(data,fn) {
			data = JSON.parse(data);
			var path = data.url;
			
			// TODO: calculate entity
			var pieces = path.split('/');
			data.entity = pieces[1];
			data.actionName = pieces[2];
			console.log(pieces);
			
			var route = urlMappings[path];
		
			// A string means this route is a redirect
			var hopcount = 0;
			while (_.isString(route)) {
				
				// redirect to actual route
				route = urlMappings[route];
				
				// In case the user created a redirect loop, hopcount halts execution
				hopcount++;
				if (hopcount > 1000) {
					throw new Error ("Over 1000 redirects detected!  You probably have a redirect loop.  Please check your url mappings.");
				}
			}
			
			route = route || handleWildcardSocketRequest(data.entity,data.actionName);
			var expressContext = socketInterpreter.interpret(data,fn,socket,app);
			return (processSocketRequest(route.controller,route.action))(expressContext.req,expressContext.res,app);
		});
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
			app.all(path,processExpressRequest(controller.id,route.action));
		}
	}

	// Handle all other cases (wildcard)
	app.all('/:entity/:action?/:id?', function(req,res,next) {
		var route = handleWildcardRequest(req,res,next);
		return (processExpressRequest(route.controller,route.action))(req,res,next);
	});
}


// Generates a function which calls the appropriate controller,
// converting a socket.io client event callback to Sails' request semantics
function processSocketRequest (controllerName,actionName) {		
	return function(req,res,app){
		
		// Mark this as a socket.io request, not XHR (even if it is)
		enhanceRequest(req,res,controllerName,actionName);
		req.xhr = req.isAjax = false;
		req.isSocket = true;
		
		
		// Save controller and action to req.params
		if (req.params) {
			req.params.action = actionName;
			req.params.controller = controllerName;
		}
		
		// TODO: Perform parameter validation middleware
		
		// Run auth middleware
		accessControlMiddleware(controllerName,actionName,req,res,function() {
			controllers[controllerName][actionName](req,res);
		});
	}
}

// Generates a function which calls the appropriate controller,
// converting an ExpressJS request to Sails' request semantics
function processExpressRequest (controllerName,actionName) {
	
	// Generate and bind request context
	return function (req,res,next) {
		
		// Save controller and action to req.params and request context
		this.controller = controllerName;
		this.action = actionName;
		req.params.action = this.action;
		req.params.controller = this.controller;
	
		enhanceRequest(req,res,controllerName,actionName);
		

		// Always share some data with views
		res.locals({
			userAgent: req.headers['user-agent'],
			session: req.session,
			title: config.appName + " | " + actionName.toCapitalized()
		});
		
		// Apply view middleware
		_.each(viewMiddleware, function (middleware) {
			middleware(config,res);
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

// Sails.js enhancements to express requests
function enhanceRequest (req,res,controllerName,actionName) {
	req.isAjax = req.xhr;
	
	// Enhance Express's render() method to automatically render-by-route
	//	res.e_render = res.render;
	res.view = function(path,data,fun){
		
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
		res.locals && res.locals(data);

		// if this is an ajax or socket request, and if extension is not specified
		if (req.isAjax || req.isSocket) {
			
			// use the JSON view equivalent if it exists
			fs.stat(app.settings.views+"/"+path+'.json', function(err, stat) {

					var fileExists = err == null;
					if (fileExists && path.split(".").length == 1) {
						path = path+'.json';
						debug.debug("Rendering JSON view for AJAX or Socket request:",path,controllerName,actionName);
					}
					else {
						debug.debug("No JSON view found for this route, rendering standard ejs view instead:for AJAX or Socket request:",path,controllerName,actionName);
					}

				// Template and render view after lookup
				res.render(path,data,fun);
			});
		} else {
			// Template and render view immediately
			res.render(path,data,fun);
		}
	}
}



function handleWildcardSocketRequest (entity,actionName) {
	
	// Map route to action
	if (_.contains(_.keys(controllers),entity)) {
		var controller = controllers[entity];

		// If action is unspecified, and this is a GET, default to index, otherwise default to Backbone semantics
		// If index is unspecified, always default to Backbone semantics
		actionName = actionName || controller['index'];

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

		}

		// If the action matches now, 
		if (controller[actionName]) {
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

		// If action is unspecified, and this is a GET, default to index, otherwise default to Backbone semantics
		// If index is unspecified, always default to Backbone semantics
		actionName = actionName || (
			(method=="GET") ? ( (controller['index']) ? "index" : "findAll" ) :
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






// Default access permissions
var permissions = function () {
	return {
		"*": true
	}
}

// Extend permissions from main file
permissions = _.extend(permissions,config.permissions || {});

// Extend permissions from config directory (legacy method)
if (path.existsSync(config.appPath+'/config/permissions.js') ) {
	permissions = _.extend(permissions,require(config.appPath+'/config/permissions').accessControlTree());
}

// Route incoming requests based on credentials
function accessControlMiddleware (controllerName,actionName,req,res,next) {
	
	// The routing directions
	var routePlan;
	
	// Traverse access control tree to determine where to route this request
	var controller = permissions[controllerName]
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
		routePlan = !_.isUndefined(permissions['*']) ? permissions['*'] : true;
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
