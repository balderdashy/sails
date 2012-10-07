// route.js
// --------------------
// The purpose of route.js is to determine a controller
// and action given a URL.  Below, we use a handful of 
// different strategies to come up with sensible assumptions.


var socketInterpreter = require("./interpreter"),
	util = require('./util');



/**
* Listen for network requests using bindRouteFn
*/
exports.listen = function(bindRouteFn) {
	startHandlingMappedRequests(bindRouteFn);
	startHandlingWildcardRequests(bindRouteFn);
};

/**
 * Listen for requests listed in the routing table
 * @bindRouteFn - the function which will be run to bind the URL path to the appropriate function
 */

function startHandlingMappedRequests(bindRouteFn) {

	// Load routing table configuration initially
	var urlMappings = _.extend({},
	// From main app config
	config.urlMappings,

	// From dedicated route mappings configuration
	path.existsSync(config.appPath + '/config/mappings.js') ? require(config.appPath + '/config/mappings').customMappings() : {});

	// Map standard AJAX and REST routes
	_.each(urlMappings, function(target, url) {
		// A string target means this is a redirect
		var hopcount = 0;
		while(_.isString(target)) {
			// Redirect: attempt to reroute using new string url
			target = urlMappings[target];
			// In case the user created a redirect loop, hopcount halts execution
			if(hopcount++ > 10) {
				throw new Error("Over 10 redirects detected!  You probably have a redirect loop.  Please check your url mappings configuration file(s).");
			}
		}
		// An object target means this maps directly to a controller and action
		if(_.isObject(target)) {

			// TODO: actually absorb verb from mappings config somehow
			// null === *any* of the HTTP verbs
			var verb = null;

			// Build handler that will be run when this route is executed
			var targetFn = function(req, res, next) {
					// Enhance Express request and response objects with Sails methods
					enhanceRequest(req, res, target.controller, target.action);

					// Run handler
					handler(req, res, next);
				};

			// Bind the target function to a URL path expression and HTTP verb
			bindRouteFn(url, targetFn, verb);
		} else {
			throw new Error('Invalid target route specified: ', target);
		}
	});
}

/**
 * Listen for wildcard requests
 * @bindRouteFn - the function which will be run to bind the URL path to the appropriate function
 */

function startHandlingWildcardRequests(bindRouteFn) {

	// Build handler that will be run when this route is executed
	// NOTE: Target cannot be determined until request actually comes in, so the targetFn is quite hefty
	var targetFn = function(req, res, next) {

			// Grab verb from request object
			var httpVerb = req.method;

			// If the action doesn't exist, use resourceful routing and Backbone semantics
			// to try and transparently route to the appropriate action.
			// (i.e. GET '/experiment' maps to ExperimentController.read()) 
			var target = {
				controller: req.param('entity'),
				action: guessAction(req)
			};

			console.log(req.param('entity'), req.param('action'), req.method, "TARGET:", target);

			// NOTE: We can safely run our guessed action here.
			// (If this route matches something in the routing table, it never would have made it this far)
			// Enhance Express request and response objects with Sails methods
			enhanceRequest(req, res, target.controller, target.action);

			// Run handler
			handler(req, res, next);
		};

	// Bind the target function to a URL path expression and all HTTP verbs
	// NOTE: routing based on verb can't be precomputed and so it must occur at runtime when the request is processed
	bindRouteFn('/:entity/:action?/:id?', targetFn, null);
}

/**
 * Given a request object with a potentially non-existent entity(controller), action, and HTTP verb,
 * return a best guess at the desired action (using resourceful routing + Backbone semantics)
 */

function guessAction(req) {

	var requestedEntity = req.param('entity'),
		requestedAction = req.param('action'),
		httpVerb = req.method;

	// Grab controller object
	var controller = sails.controllers[requestedEntity];

	// If requestedAction was not specified
	if(!requestedAction) {
		// For GET requests
		if(httpVerb == 'GET') {
			// default to index(), but only if it exists in the controller
			if(controller && controller['index']) {
				return 'index';
			}
			// if no index() is specified, use read()
			else {
				return 'read';
			}
		}
		// for POST requests
		else if(httpVerb == 'POST') {
			// use create()
			return 'create';
		}
	}
	// If requestedAction was specified, but if doesn't exist in controller 
	else if (controller && !controller[requestedAction]) {
		// If :action is actually an integer (an :id url parameter)
		if(!_.isNaN(+requestedAction)) {
			// Update request parameters accordingly
			req.params.id = +requestedAction;

			// For GET requests
			if(httpVerb == 'GET') {
				return 'read';
			}
			// for PUT requests
			else if(httpVerb == 'PUT') {
				// use create()
				return 'update';
			}
			// for PUT requests
			else if(httpVerb == 'DELETE') {
				// use create()
				return 'destroy';
			}
		}
	}
	// If controller doesn't exist at all, or the controller AND action both exist,
	// simply return the requested action
	else {
		return requestedAction;
	}
}



/**
 * Given an http request object, return the proper handler function.
 * If an action isn't specified, make a guess using the HTTP verb and backbone semantics
 * If no controller or action exists, but a view exists, render the view
 * If no controller or action exists, but a model exists, scaffold a response
 */

function handler(req, res, next) {

	// TODO: Parse initial route data from request
	var requestedEntity = req.param('entity'),
		requestedAction = req.param('action'),
		httpVerb = req.method;

	// Defaults for controller, action, and handler function
	// (if action is not specified, use 'index')
	var controller = requestedEntity && sails.controllers[requestedEntity],
		action = requestedAction || 'index',
		fn = controller && controller[action];

	// ******* TODO **********	
	// Run authentication middleware
	// (Checks if the requesting user has a valid session and appropriate permissions 
	// to access this controller+action with the specified request parameters and http verb)
	// ******* TODO **********


	// if the handler fn is valid, run it!
	if(fn) {
		runHandler(req, res, next, fn);
	} else {

		// If the proper view exists,
		fs.stat(app.settings.views + "/" + requestedEntity + "/" + action + ".ejs", function(err, stat) {
			if(err === null) {
				// return an anonymous action which renders it.
				fn = function(req, res) {
					res.view();
				};
			}
			// If no view exists EITHER
			else {
				// but a model exists for this entity and the action is a CRUD method 
				// (or is a likely plain-english CRUD synonym) 
				if(qualifiedForScaffold(requestedEntity, requestedAction)) {
					// Normalize the action using the CRUD synonym lookup table
					action = crudSynonyms[action] || action;

					// And use the JSON scaffold controller to return an anonymous action.
					var scaffoldController = require('./scaffolds/controller').definition(requestedEntity);
					fn = scaffoldController[action];
				}
			}

			// Finish up and run route handler function
			runHandler(req, res, next, fn);
		});
	}
}

/**
 * Run the route handler fn
 */

function runHandler(req, res, next, fn) {
	// TODO: run any additional middleware (i.e. request parameter validation)
	// If no valid route handler can be found or scaffolded, redirect to the default 404 page
	fn = fn || sails.controllers.meta.notfound;

	// Finally, run handler function
	fn(req, res, next);
}



/**
 * Apply Sails.js enhancements to an Express request
 */

function enhanceRequest(req, res, controllerName, actionName) {

	// Set action and controller as request parameters for use in controllers and views
	req.params.controller = req.params.entity = controllerName;
	req.params.action = actionName;

	// Add *verb* attribute to request object
	req.verb = req.method;

	// Add isAjax flag to request object
	req.isAjax = req.xhr;

	// Add res.view() method to request object
	// res.view() is an enhanced version of  Express's res.render()
	// which automatically renders the appropriate view based on the entity and action
	// Note: the original function is still accessible via res.render()
	res.view = function(specifiedPath, data, fun) {
		data = data || {};

		// By default, generate a path to the view using what we know about the controller+action
		var path = controllerName + "/" + actionName;

		// If the path to a view was explicitly specified, use that
		if(_.isString(specifiedPath)) {
			path = specifiedPath;
		} else if(_.isObject(specifiedPath)) {
			// If a map of data is provided as the first argument, use it
			data = (_.isObject(path)) ? path : data;
		}

		// Set view data
		res.locals && res.locals(data);

		// Render the view
		res.render(path, data, fun);
	}
}


// Map of various synonyms to the Sails standard CRUD method names
var crudSynonyms = {
	"delete": "destroy",
	destroy: "destroy",
	remove: "destroy",

	edit: "update",
	modify: "update",
	update: "update",

	view: "read",
	show: "read",
	detail: "read",
	read: "read",
	find: "read",
	findAll: "read",

	create: "create",
	add: "create",
	"new": "create"
};

/**
 * Return whether the specified actionName is a CRUD operation, index, or falsy
 */

function isCrudOrIndexAction(actionName) {
	return(_.contains(_.keys(crudSynonyms), actionName) || actionName == 'index' || !actionName);
};

/**
 * Return whether the entity corresponds to an existing model
 */

function entityMatchesExistingModel(entity) {
	return typeof global[_.str.capitalize(entity)] !== "undefined";
};

/**
 * Return whether this entity/action tuple qualifies to use scaffold methods
 */

function qualifiedForScaffold(entity, action) {
	return isCrudOrIndexAction(action) && entityMatchesExistingModel(entity);
}






// Enable rigging if specified
var viewMiddleware = [];
if(config.rigging) {
	viewMiddleware.push(config._riggingLib.middleware);
}

// Enable other view middleware for use in sails modules
if(config.viewMiddleware) {
	viewMiddleware.concat(config.viewMiddleware);
}



// Default access permissions
var permissions = function() {
	return {
		"*": true
	};
};

// Extend permissions from main file
permissions = _.extend(permissions, config.permissions || {});

// Extend permissions from config directory (legacy method)
if(path.existsSync(config.appPath + '/config/permissions.js')) {
	permissions = _.extend(permissions, require(config.appPath + '/config/permissions').accessControlTree());
}

// Route incoming requests based on credentials

function accessControlMiddleware(controllerName, actionName, req, res, next) {

	// The routing directions
	var routePlan;

	// Traverse access control tree to determine where to route this request
	var controller = permissions[controllerName]
	if(controller && (!_.isUndefined(controller[actionName]) || !_.isUndefined(controller['*']))) {
		var action = controller[actionName]
		if(!_.isUndefined(action)) {

			// Use action route plan
			routePlan = action;
		} else {
			// Use controller default
			routePlan = controller['*'];
		}
	} else {
		// Use app default
		routePlan = !_.isUndefined(permissions['*']) ? permissions['*'] : true;
	}

	// Rereoute if necessary (exit middleware)
	reroute(routePlan, req, res, next);
}


// Reroute as a result of access control

function reroute(routePlan, req, res, next) {
	// If routePlan is boolean, allow or deny from all accordingly
	if(routePlan === true) {
		next();
	}
	// Prevent redirect loops by always setting access to '/403' to true
	else if(req.url === '/403') {
		next();
	} else if(routePlan === false) {
		res.render('403', {
			title: 'Access Denied'
		});
	}
	// if the routePlan is a function, treat it as basic middleware
	else if(_.isFunction(routePlan)) {
		routePlan(req, res, next);
	}

	// TODO: Role-aware route plans ("user", "admin", ["user","editor"], etc.)
	// TODO: complex condition routePlan objects
}



// Set up routing table for socket requests
exports.mapSocketRequests = function(app, io) {

	// Load routing table configuration initially
	var urlMappings = _.extend({},
	// From main app config
	config.urlMappings,

	// From dedicated route mappings configuration
	path.existsSync(config.appPath + '/config/mappings.js') ? require(config.appPath + '/config/mappings').customMappings() : {});

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
}


function processSocketRequest(controllerName, actionName) {
	return function(req, res, app) {
		enhanceRequest(req, res, controllerName, actionName);
		req.xhr = req.isAjax = false;
		req.isSocket = true; // Mark this as a socket.io request, not XHR (even if it is)
		// Save controller and action to req.params
		req.params.action = actionName;
		req.params.controller = controllerName;

		// TODO: Run parameter validation middleware
		// Run auth middleware
		accessControlMiddleware(controllerName, actionName, req, res, function() {
			var scaffoldedController = require('./scaffolds/controller').definition(controllerName);
			var controller = sails.controllers[controllerName] || {};

			// Provide scaffolded actions where this controller is missing them
			controller = _.extend(controller, scaffoldedController);



			// TODO: issue 404 if action does not exist
			(_.bind(controller[actionName], controller))(req, res);
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