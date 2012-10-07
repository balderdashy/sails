// route.js
// --------------------
// The purpose of route.js is to determine a controller
// and action given a URL.  Below, we use a handful of 
// different strategies to come up with sensible assumptions.
// Listen: Start listening for requests with bindRouteFn
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

			// Find or build controller function
			var targetFn = function (req,res,next) {
				enhanceRequest(req,res,target.controller,target.action);
				handler(req,res,next);
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

	// Find or build controller function
	// NOTE: Target cannot be determined until request actually comes in, so the targetFn is quite hefty
	var targetFn = function(req, res, next) {

			// Grab verb from request object
			var httpVerb = req.method;

			// Find or build controller function
			var target = handleWildcardRequest(req, res, next);
			enhanceRequest(req,res,target.controller,target.action);
			handler(req,res,next);
		};

	// Bind the target function to a URL path expression and all HTTP verbs
	// NOTE: routing based on verb can't be precomputed and so it must occur at runtime when the request is processed
	bindRouteFn('/:entity/:action?/:id?', targetFn, null);
}


/**
* Given an http request object, return the proper handler function.
* If an action isn't specified, make a guess using the HTTP verb and backbone semantics
* If no controller or action exists, but a view exists, render the view
* If no controller or action exists, but a model exists, scaffold a response
*/
function handler(req,res,next) {

	// TODO: Parse initial route data from request
	var requestedEntity = req.param('entity'), 
		requestedAction = req.param('action'), 
		httpVerb = req.method;

	// Defaults for controller, action, and handler function
	// (if action is not specified, use 'index')
	var controller = requestedEntity && sails.controllers[requestedEntity],
		action = requestedAction || 'index',
		fn = controller && controller[action];
		
	// Run authentication middleware
	// (Checks if the requesting user has a valid session and appropriate permissions 
	// to access this controller+action with the specified request parameters and http verb)
	// if the handler fn is valid, run it!
	if (fn) {
		runHandler(req,res,next,fn);
	}
	else {
		// If the fn is still unknown, use resourceful routing and Backbone semantics
		// to try and transparently route to the appropriate action.
		// (i.e. GET '/experiment' maps to ExperimentController.read()) 
		// TODO

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
			runHandler(req,res,next,fn);
		});
	}
}

/**
* Run the route handler fn
*/
function runHandler (req,res,next,fn) {
	// TODO: run any additional middleware (i.e. request parameter validation)
	
	// If no valid route handler can be found or scaffolded, redirect to the default 404 page
	fn = fn || sails.controllers.meta.notfound;

	// Finally, run handler function
	fn(req,res,next);
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
		}
		else if (_.isObject(specifiedPath)) {
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


/**
 * Use resourceful routing when the route is not explicitly defined
 * (tries to match up an arbitrary request with a controller and action)
 * (also supports backbone semantics)
 */

function handleWildcardRequest(req, res, next) {

	var entity = req.param('entity'),
		actionName = req.param('action'),
		method = req.method;

	// Map route to action
	if(_.contains(_.keys(sails.controllers), entity)) {
		var controller = sails.controllers[entity];

		// If action is unspecified, and this is a GET, default to index, otherwise default to Backbone semantics
		// If index is unspecified, always default to Backbone semantics
		actionName = actionName || (
		(method == "GET") ? ((controller['index']) ? "index" : "findAll") : (method == "POST") ? "create" : actionName);


		if(!controller[actionName]) {
			// actionName = crudSynonyms[actionName] || actionName;
			// Attempt to parse resource id from parameters
			if(!_.isNaN(+actionName)) {
				req.params.id = +actionName;


				// Default to Backbone semantics
				actionName = (
				(method == "PUT") ? "update" : (method == "DELETE") ? "destroy" : actionName);
			}

			req.params.action = actionName;
		}

		// If the action matches now, we're good to go
		if(controller[actionName]) {
			req.params.action = actionName;
			return {
				controller: entity,
				action: actionName
			};
		}
	} else {
		// No controller by that entity name exists
	}

	// // If that fails, but this is a CRUD or index action, 
	// // and the controller name matches an existing model, use the scaffold
	// if ( isCrudOrIndexAction(actionName) && entityMatchesExistingModel(entity) ) {
	// 	actionName = crudSynonyms[actionName] || actionName || "index";
	// 	req.params.action = actionName;
	// 	return {
	// 		controller: entity,
	// 		action: actionName
	// 	};
	// }
	return {
		controller: entity,
		action: actionName
	};

	// // If that fails, just display the 404 page
	// return {
	// 	controller: "meta",
	// 	action: "notfound"
	// };
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// process.exit(0);
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
var socketInterpreter = require("./interpreter"),
	util = require('./util');

// Instantiate all controller modules
// var controllers = {},
// 	controllerFiles = require('require-all')({ 
// 		dirname: config.appPath + '/controllers',
// 		filter: /(.+Controller)\.js$/
// 	});
// _.each(controllerFiles,function (controller, filename) {
// 	// If no 'id' attribute was provided, take a guess based on the filename
// 	var className = controller.identity || filename.replace(/Controller/, "");
// 	className = className.toLowerCase();
// 	if (!controller.identity) {
// 		controller.identity = className;
// 	}
// 	controllers[className] = controller;
// });
// // Provide globally accessible list of controller names
// global.controllerNames = _.keys(controllers);
// If no MetaController was provided, use the default
//if (!controllers['meta']) {
//	controllers['meta'] = require(__dirname + '/scaffolds/controllers/MetaController');
//	
//	// if suitable views don't exist in the expected places, create them
//	
//}
// Default route mappings
// var urlMappings = {
// 	'/': {
// 		controller:'meta',
// 		action:'home'
// 	},
// 	'/500': {
// 		controller:'meta',
// 		action:'error'
// 	},
// 	'/404': {
// 		controller:'meta',
// 		action:'notfound'
// 	},
// 	'/403': {
// 		controller:'meta',
// 		action:'denied'
// 	}
// };
// // Extend mappings from main file
// urlMappings = _.extend(urlMappings,config.urlMappings || {});
// // Extend mappings from config directory
// if (path.existsSync(config.appPath+'/config/mappings.js') ) {
// 	urlMappings = _.extend(urlMappings,require(config.appPath+'/config/mappings').customMappings() || {});
// }
// Enable rigging if specified
var viewMiddleware = [];
if(config.rigging) {
	viewMiddleware.push(config._riggingLib.middleware);
}

// Enable other view middleware for use in sails modules
if(config.viewMiddleware) {
	viewMiddleware.concat(config.viewMiddleware);
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

	// // Otherwise, just display the 404 page
	// return {
	// 	controller: "meta",
	// 	action: "notfound"
	// };
}



// Default access permissions
var permissions = function() {
		return {
			"*": true
		}
	}

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





// Set up routing table for standard http(s) requests
// exports.mapExpressRequests = function mapExpressRequests (app) {
// 	// Map standard AJAX and REST routes
// 	for (var path in urlMappings) {
// 		var route = urlMappings[path],
// 		controller, action;
// 		// A string means this route is a redirect
// 		if (_.isString(route)) {
// 			// Map route
// 			app.all(path,(function (redirectRoute) {
// 				return function (req,res,next) { 
// 					debug.debug("Redirecting to "+redirectRoute+" from " + req.url+ "...");
// 					res.redirect(redirectRoute);
// 				}
// 			})(route));
// 		}
// 		// An object means this route route maps directly to a controller
// 		else {			
// 			app.all(path,processExpressRequest(route.controller,route.action));
// 		}
// 	}
// 	// Handle all other cases (wildcard)
// 	app.all('/:entity/:action?/:id?', function(req,res,next) {
// 		var route = handleWildcardRequest(req,res,next);
// 		return (processExpressRequest(route.controller,route.action))(req,res,next);
// 	});
// }
// Generates a function which calls the appropriate controller,
// converting a socket.io client event callback to Sails' request semantics
// // Generates a function which calls the appropriate controller,
// // converting an ExpressJS request to Sails' request semantics

// function processExpressRequest(controllerName, actionName, httpVerb) {

// 	// Generate and bind request context
// 	return function(req, res, next) {

// 		// Save controller and action to req.params and request context
// 		this.controller = controllerName;
// 		this.action = actionName;
// 		req.params.action = this.action;
// 		req.params.controller = this.controller;

// 		// index
// 		if(!actionName) {
// 			actionName = "index";
// 			req.params.action = actionName;
// 		}

// 		enhanceRequest(req, res, controllerName, actionName);


// 		// Always share some data with views
// 		res.locals({
// 			userAgent: req.headers['user-agent'],
// 			session: req.session,
// 			title: config.appName + " | " + _.str.capitalize(actionName)
// 		});

// 		// Apply view middleware
// 		_.each(viewMiddleware, function(middleware) {
// 			middleware(config, res);
// 		});


// 		// Run auth middleware
// 		accessControlMiddleware(this.controller, this.action, req, res, function() {

// 			// Validate parameters
// 			// TODO
// 			// parameterMiddleware(req,res,function() {
// 			// 
// 			// });
// 			var controller = sails.controllers[controllerName] || {};

// 			// If the action exists now
// 			if(_.isFunction(controller[actionName])) {
// 				// Excute it in request context
// 				controller[actionName](req, res);
// 			}
// 			// Otherwise
// 			else {

// 				// If a view exists for this controller without a matching action,
// 				// use a stub action that redirects to the appropriate view
// 				var viewPath = controllerName + "/" + actionName + ".ejs";
// 				console.log("Stat-ing ", viewPath);
// 				fs.stat(app.settings.views + "/" + viewPath, function(err, stat) {
// 					var fileExists = err === null;
// 					if(fileExists) {
// 						// Template and render view
// 						res.view();
// 					} else {
// 						// If this is a CRUD or index action, 
// 						// and the controller name matches an existing model,
// 						if(isCrudOrIndexAction(actionName) && entityMatchesExistingModel(controllerName)) {
// 							// Provide scaffolded actions where this controller is missing them
// 							var scaffoldedController = require('./scaffolds/controller').definition(controllerName);
// 							controller = _.extend(controller, scaffoldedController);
// 							console.log("CONTROLLER", controller);

// 							// Normalize actionName using CRUD synonyms
// 							actionName = crudSynonyms[actionName] || actionName || "index";
// 							req.params.action = actionName;
// 						}

// 						// If the action exists now
// 						if(_.isFunction(controller[actionName])) {
// 							// Excute it in request context
// 							controller[actionName](req, res);
// 						} else {
// 							// Respond with 404 if neither action nor view exists
// 							// If that fails, just display the 404 page
// 							sails.controllers.meta.notfound(req, res);
// 						}
// 					}
// 				});
// 			}
// 		});
// 	};
// }