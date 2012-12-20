// route.js
// --------------------
// The purpose of route.js is to determine a controller
// and action given a URL.  Below, we use a handful of 
// different strategies to come up with sensible assumptions.
var socketInterpreter = require("./interpreter"),
	util = require('./util'),
	aclMiddleware = require('./acl'),
	riggingViewPartials = require('./assets'),
	rigging = require('rigging');

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

	// Map standard AJAX and REST routes
	_.each(urlMappings, function(target, url) {

		// Get a route object from the url mapping
		var route = exports.parseMappedUrl(url);

		// Bind the target function to a URL path expression and HTTP verb
		bindRouteFn(url, handleRequest(route), route && route.verb);
	});
}

/**
 * Given a URL (@url), scan the route mappings
 * and return an entity/action/verb object
 * If no match exists, return null
 */
var parseMappedUrl = exports.parseMappedUrl = function(url) {
		// Start with the url as the target
		var target = url;

		// A string target means this is a redirect
		// Redirect: attempt to reroute using new string url
		// If no match can be found, leave target as a string
		// Then it will be resourcefully routed if possible at runtime with a wildcard handler
		var hopcount = 0;
		while(_.isString(target) && urlMappings[target]) {
			target = urlMappings[target];

			// In case the user created a redirect loop, hopcount halts execution
			if(hopcount++ > 10) {
				throw new Error("Over 10 redirects detected!  You probably have a redirect loop.  Please check your url mappings configuration file(s).");
			}

		}

		// If a specific verb was specified in the mapping, use it
		// (otherwise this handler will listen for *any* of the HTTP verbs)
		var verb = _.last(url.match(/^(get|post|put|delete|trace|options|connect|patch|head)\s+/) || []) || null;

		// An object target means this maps directly to a controller and action
		if(_.isObject(target)) {

			// Return a complete route object for this target URL
			return _.extend({
				verb: verb
			}, target);
		}
		// Target is a string which maps to a controller/action which may not exist yet
		else if(_.isString(target)) {
			// Parse the entity/action for this url
			var routeObj = util.parsePath(target);

			// Add controller key to route object to map to routes.js conventions
			routeObj.controller = routeObj.entity;

			// Return a complete route object for this target URL
			return _.extend({
				verb: verb
			}, routeObj);
		}
		// No match exists, return null 
		else if(!target) {
			return null;
		} else {
			sails.log.error('Invalid target route specified:', target, " from: ", url);
			throw new Error('Invalid target route specified.');
		}
	};

/**
 * Listen for wildcard requests
 * @bindRouteFn - the function which will be run to bind the URL path to the appropriate function
 */

function startHandlingWildcardRequests(bindRouteFn) {

	// Bind the target function to a URL path expression and all HTTP verbs
	// NOTE: routing based on verb can't be precomputed and so it must occur at runtime when the request is processed
	bindRouteFn('/:entity/:action?/:id?', handleRequest(), null);

	// TODO: Use a more complex, but welcoming regex
	// bindRouteFn(/\/(\S+)(\/\S+)?(\/(\S+))?(\/(\S+))*/, targetFn, null);
}

/**
 * Handle a request
 */
var handleRequest = exports.handleRequest = function(target) {
		/**
		 * Handler fn
		 *
		 * @req - the Connect request object
		 * @res - the Connect response object
		 * @next - the Connect next() function
		 */
		return function(req, res, next) {

			// If the action doesn't exist, use resourceful routing and Backbone semantics
			// to try and transparently route to the appropriate action.
			// (i.e. GET '/experiment' maps to ExperimentController.read()) 
			var myTarget = {
				controller: (target && target.controller) || req.param('entity'),
				action: (target && target.action) || guessAction(req)
			};

			// NOTE: We can safely run our guessed action here.
			// (If this route matches something in the routing table, it never would have made it this far)
			// Enhance Express request and response objects with Sails methods
			enhanceRequest(req, res, myTarget.controller, myTarget.action);
	
			// Make rigging middleware view partials accessible
			res.locals({
				rigging: _.objInvoke(riggingViewPartials)
			});

			// Run handler
			handler(req, res, next);
		
		};
	};

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
		// for DELETE requests (Delete all!)
		else if(httpVerb == 'DELETE') {
			return 'destroy';
		}
	}
	// If requestedAction is actually an integer (an :id url parameter)
	else if(_.isFinite(+requestedAction)) {

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
	// otherwise the action was specified
	// so just return it transparently
	else {
		return requestedAction;
	}
}



/**
 * The handler function, given an http request object, with the controller and action already decided
 */

function handler(req, res, next) {

	// Parse initial route data from request
	var requestedEntity = req.param('entity'),
		requestedAction = req.param('action'),
		httpVerb = req.method;

	// Defaults for controller, actionName, and handler function
	// (if actionName is not specified, use 'index')
	var controller = requestedEntity && sails.controllers[requestedEntity],
		actionName = requestedAction || 'index',
		fn = controller && controller[actionName];


	// If fn does not exist, we'll use the CRUD synonym lookup table to normalize it
	// If it doesn't exist in the CRUD synonym table, it remains as is
	if (!fn) {
		actionName = crudSynonyms[actionName] || actionName;
		fn = controller && controller[actionName];
	}


	// Enforce ACL middleware
	// (Checks if the requesting user has a valid session and appropriate permissions 
	// to access this controller+actionName with the specified request parameters and session)
	aclMiddleware.enforce(requestedEntity, actionName, req, res, afterwards);

	// After policy is enforced, the handler function can be run
	function afterwards() {

		// if the handler fn is valid, run it!
		if(fn) {
			runHandler(req, res, next, fn);
		}
		// If it's not valid
		else {

			// If the proper view exists, go ahead and render it
			fs.stat(app.settings.views + "/" + requestedEntity + "/" + actionName + ".ejs", function(err, stat) {
				if(err === null) {
					fn = renderStaticView;
				}
				// If no view exists EITHER
				else {
					// but a model exists 
					if(qualifiedForScaffold(requestedEntity, actionName)) {
						
						// And use the JSON scaffold controller to return the appropriate CRUD action handler.
						var scaffoldController = require('./scaffolds/controller').definition(requestedEntity);
						fn = scaffoldController[actionName];
					}
				}

				// Finish up and run route handler function
				runHandler(req, res, next, fn);
			});
		}
	}
}

/**
 * Run the route handler fn
 */

function runHandler(req, res, next, fn) {

	
	// If no valid route handler can be found or scaffolded, redirect to the default 404 page
	if (!fn) {
		// Respond using 404 page if possible
		if (_.isFunction(sails.controllers.meta && sails.controllers.meta.notfound)) {
			fn = sails.controllers.meta.notfound;
		}
		else {
			res.send(404);
			return;
		}
	}

	// Finally, run handler function
	fn(req, res, next);
}



/**
 * Apply Sails.js enhancements to an Express request
 */

function enhanceRequest(req, res, controllerName, actionName) {

	// Provide error messages for req.listen and res.broadcast if they don't exist
	req.listen = req.listen || notSupported("req.listen()");
	res.broadcast = res.broadcast || notSupported("res.broadcast()");

	// Always share some data with views
	res.locals({
		userAgent: req.headers['user-agent'],
		session: req.session,
		title: sails.config.appName + " | " + _.str.capitalize(actionName),
		controller: controllerName,
		action: actionName
	});

	// Add req.protocol
	req.protocol = req.protocol ? req.protocol : req.header('X-Forwarded-Protocol') == "https" ? "https" : "http";

	// Add req.host
	// (remove port if it exists)
	req.host = req.host || req.header('host');
	req.rawHost = req.host.split(':')[0];

	// Add req.port
	req.port = req.port ? req.port : app.address().port;

	// Add req.rootUrl convenience method
	req.rootUrl = req.protocol + '://' + req.rawHost  + ( req.port == 80 || req.port == 443 ? '' : ':'+req.port );


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
		// If a map of data is provided as the first argument, use it (and just use the default path)
		else if(_.isObject(specifiedPath)) {
			data = specifiedPath;
		}

		// Stringify data 
		var stringifiedData = _.objMap(data, function(attr) {
			return JSON.stringify(attr);
		});

		// TODO: work with the appropriate Adapters to fulfill promise objects in *data*
		// TODO: special logic for handling .js views

		// In development mode, recompile LESS files each time a view is served
		if (sails.config.environment === "development") {
			sails.log.verbose("Development mode: Recompiling SASS, LESS, and CoffeeScript...");
			rigging.compile(sails.config.rigging.sequence, {
				environment: sails.config.environment,
				outputPath: sails.config.rigging.outputPath
			}, finallyRenderTheView);
		}
		else finallyRenderTheView();

		
		function finallyRenderTheView () {
			res.render(path, data, fun);
		}
	};

	// Respond with a message indicating that the feature is not currently supported
	function notSupported(method) {
		return function () {
			sails.log.warn(method+" is only supported using Socket.io!");
		};
	}
}


/**
 * Basic url handler which renders the view for a request with a controller and action specified
 */
function renderStaticView(req, res) {
	res.view();
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
}

/**
 * Return whether the entity corresponds to an existing model
 */

function entityMatchesExistingModel(entity) {
	return typeof global[_.str.capitalize(entity)] !== "undefined";
}

/**
 * Return whether this entity/action tuple qualifies to use scaffold methods
 */

function qualifiedForScaffold(entity, action) {
	return isCrudOrIndexAction(action) && entityMatchesExistingModel(entity);
}
