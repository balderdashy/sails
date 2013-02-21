// router.js
// --------------------
//
// Determine a controller and action given a URL.
// Below, we start with the explicit routing table, then 
// use a handful of different strategies to come up with 
// sensible assumptions about where the URL should route by default.

var socketInterpreter = require("./interpreter");
var util = require('sails-util');

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
	_.each(sails.routes, function(target, urlExpr) {

		// If a specific verb was specified in the mapping, use it
		// (otherwise this handler will listen for *any* of the HTTP verbs)
		var verbExpr = /^(get|post|put|delete|trace|options|connect|patch|head)\s+/;
		verb = _.last(urlExpr.match(verbExpr) || []) || null;

		// If a verb was specified, eliminate the verb from the urlExpr
		if (verb) urlExpr = urlExpr.replace(verbExpr,"");

		// Get a urlExpr object from the url mapping and extend with the verb
		var actualTarget = fetchRoute(urlExpr,verb);
		actualTarget = _.extend(actualTarget,{verb: verb});

		// Bind the target function to a URL path expression and HTTP verb
		// This is where verb enforcement occurs
		bindRouteFn(urlExpr, handleRequest(actualTarget), actualTarget && actualTarget.verb);
	});
}

/**
 * Given a clean URL (@url) and a verb, combine them, 
 * then scan the route mappings and return an entity/action object.
 * If no match exists, return null.
 */
var fetchRoute = exports.fetchRoute = function(url, verb) {
		
		// Build target set (start with url)
		var target = url;

		// A string target means this is a redirect
		// If no match can be found, leave target as a string
		// Then it will be resourcefully routed if possible at runtime with a wildcard handler
		var hopcount = 0;
		var targetExists = true;
		while(_.isString(target) && targetExists ) {

			// Try both the simple target and the fully qualified target (verb + URL)
			var fullyQualifiedTarget = verb && (verb.toLowerCase() + " " + target);
			var newTarget = sails.routes[fullyQualifiedTarget] || sails.routes[target];
			if (!newTarget) {
				// If no target found, keep it as a string and break from the redirect hunt
				break;
			}
			else target = newTarget;
			targetExists = !! target;

			// In case the user created a redirect loop, hopcount halts execution
			if(hopcount++ > 10) {
				throw new Error("Over 10 redirects detected!  You probably have a redirect loop.  Please check your url mappings configuration file(s).");
			}

		}

		// An object target means this maps directly to a controller and action
		if(_.isObject(target)) {

			// Return a complete route object for this target URL
			return _.extend(target, { verb: verb });
		}
		// Target is a string which maps to a controller/action which may not exist yet
		else if(_.isString(target)) {
			// Parse the entity/action for this url
			var routeObj = util.parsePath(target);

			// Add controller key to route object to map to routes.js conventions
			routeObj.controller = routeObj.entity;

			// Return a complete route object for this target URL
			return _.extend(routeObj, {verb: verb});
		}
		// No match exists, return null 
		else if (!target) {
			return null;
		} else {
			sails.log.error('Invalid target route specified: '+ target+ " from: "+ url);
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

			// If defined, pull entity and action from target into request object
			if (target && target.controller && !req.param('entity')) {
				req.params.entity = target.controller;
			}
			else if (target && target.action && !req.param('action')) {
				req.params.action = target.action;
			}

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
	var controller = sails.controllers[requestedEntity.toLowerCase()];

	// If requestedAction was not specified
	if(!requestedAction) {
		// For GET requests
		if(httpVerb == 'GET') {
			// default to index()
			return 'index';
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
			return 'find';
		}
		// for PUT requests
		else if(httpVerb == 'PUT') {
			return 'update';
		}
		// for PUT requests
		else if(httpVerb == 'DELETE') {
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
	var controller = requestedEntity && sails.controllers[requestedEntity.toLowerCase()],
		actionName = requestedAction || 'index',
		fn = controller && controller[actionName];


	// If fn does not exist, we'll use the CRUD synonym lookup table to normalize it
	// If it doesn't exist in the CRUD synonym table, it remains as is
	if(!fn) {
		actionName = crudSynonyms[actionName] || actionName;
		fn = controller && controller[actionName];
	}

	// Run policy
	// (For instance, might check if the requesting user has a valid session and appropriate permissions 
	// to access this controller+actionName with the specified request parameters and session)
	runPolicy(requestedEntity, actionName, req, res, afterwards);

	// After policy middleware is run, the main controller function can be run
	function afterwards() {

		// If 'index' view doesn't exist, 
		// interpret it as 'find' or 'findAll' and check for that view
		if (actionName === 'index') {
			checkIfViewExists(requestedEntity, actionName, function (err, exists) {
				if (err) throw new Error(err);
				if (exists) afterThat(err,exists);
				else {
					actionName = req.param('id') ? 'find' : 'findAll';
					req.params.action = actionName;
					fn = controller[actionName];
					checkIfViewExists(requestedEntity, actionName, afterThat);
				}
			});	
		}
		// Otherwise, just check once if the view exists
		else checkIfViewExists(requestedEntity, actionName, afterThat);

		// Determine if the view to render exists
		function afterThat(err, exists) {
			if (err) throw new Error(err);

			// then add res.viewExists flag to response object
			res.viewExists = !!exists;

			// Override next() to trigger the scaffold, but only if it exists
			if (qualifiedForScaffold(requestedEntity, actionName)) {
				var nextFn = require('./scaffolds/controller').definition(requestedEntity)[actionName];
				next = function (nextReq,nextRes, next ){
					if (! (nextReq && nextRes) ) nextFn(req,res,next);
					else nextFn(nextReq, nextRes, next);
				};
			}

			// if the handler fn is valid, run it!
			if(fn) return runHandler(req, res, next, fn);

			// If it's not valid
			else {

				// If a model exists, and the action is in the scaffold
				if(qualifiedForScaffold(requestedEntity, actionName)) {

					// Use the JSON scaffold controller to return the appropriate CRUD action handler.
					var scaffoldController = require('./scaffolds/controller').definition(requestedEntity);
					var scaffoldAction = scaffoldController[actionName];
					return runHandler(req, res, next, scaffoldAction);

				}

				// Otherwise if the proper view exists, go ahead and render it
				else if (res.viewExists) return runHandler(req, res, next, renderStaticView);

				// Respond with notFound/404 behavior
				else return runHandler(req, res, next);
			}
		}
	}
}

// Respond whether a view exists for the specified entity and action
function checkIfViewExists (entity, action, cb) {
	var pattern = sails.express.app.settings.views + "/" + entity + "/" + action + ".*";


	// If the proper view exists, go ahead and render it
	require("glob")(pattern, {}, function (err,matches) {
		if (err) return cb(err);
		
		// View exists
		else if (matches && matches.length) return cb(null, matches);

		// View does not exist
		else return cb();
	});
}

/**
 * Run the route handler fn
 */
function runHandler(req, res, next, fn) {
	var notFoundScaffold = require('./scaffolds/notFound');
	
	// If no valid route handler can be found or scaffolded, redirect to the default 404 page
	if(!fn || !_.isFunction(fn)) {
		return notFoundScaffold(req,res);
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
		action: actionName,
		req: req,
		res: res
	});

	// Add req.protocol
	req.protocol = req.protocol ? req.protocol : req.header('X-Forwarded-Protocol') == "https" ? "https" : "http";

	// Add req.host
	// (remove port if it exists)
	req.host = req.host || req.header('host');
	req.rawHost = req.host.split(':')[0];

	// Add req.port
	req.port = req.port ? req.port : sails.express.app.address().port;

	// Add req.rootUrl convenience method
	req.rootUrl = req.protocol + '://' + req.rawHost + (req.port == 80 || req.port == 443 ? '' : ':' + req.port);


	// Set action and controller as request parameters for use in controllers and views
	req.params.controller = req.params.entity = controllerName;
	req.params.action = actionName;

	// Add *verb* attribute to request object
	req.verb = req.method;

	// Add flags to request object
	req.isAjax = req.xhr;
	req.isJson = req.header('content-type') === 'application/json';
	req.acceptJson = req.header('Accept') === 'application/json';
	req.isJsony = req.isJson || req.acceptJson;

	// Add res.view() method to response object
	// res.view() is an enhanced version of  Express's res.render()
	// which automatically renders the appropriate view based on the entity and action
	// Note: the original function is still accessible via res.render()
	res.view = function(specifiedPath, data, fun) {
		data = data || {};

		// By default, generate a path to the view using what we know about the controller+action
		var path = req.param('entity') + "/" + req.param('action');

		// If the path to a view was explicitly specified, use that
		if(_.isString(specifiedPath)) {
			path = specifiedPath;
		}
		// If a map of data is provided as the first argument, use it (and just use the default path)
		else if(_.isObject(specifiedPath)) {
			data = specifiedPath;
		}

		// Stringify data 
		var stringifiedData = util.objMap(data, function(attr) {
			return JSON.stringify(attr);
		});

		// TODO: work with the appropriate Adapters to fulfill promise objects in *data*

		// In development mode, recompile LESS files each time a view is served
		if(sails.config.environment === "development") {
			sails.log.verbose("Development mode: Recompiling SASS, LESS, and CoffeeScript...");
			finallyRenderTheView();
		} else finallyRenderTheView();


		function finallyRenderTheView() {
			res.render(path, data, fun);
		}
	};

	// Respond with a message indicating that the feature is not currently supported
	function notSupported(method) {
		return function() {
			sails.log.warn(method + " is only supported using Socket.io!");
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

	destroy: "destroy",
	"delete": "destroy",
	remove: "destroy",

	update: "update",
	edit: "update",
	modify: "update",

	find: "find",
	view: "find",
	show: "find",
	detail: "find",
	read: "find",
	get: "find",

	findAll: "findAll",
	fetch: "findAll",
	list: "findAll",

	create: "create",
	add: "create",
	"new": "create"

};

/**
 * Return whether the specified actionName is a CRUD operation, or falsy
 */
function isCrudAction(actionName) {
	return(_.contains(_.keys(crudSynonyms), actionName) || !actionName);
}

/**
 * Return whether the entity corresponds to an existing model
 */

function entityMatchesExistingModel(entity) {
	return typeof sails.models[entity] !== "undefined";
}

/**
 * Return whether this entity/action tuple qualifies to use scaffold methods
 */

function qualifiedForScaffold(entity, action) {
	return isCrudAction(action) && entityMatchesExistingModel(entity);
}



// Determine route plan for incoming requests based on policy
function runPolicy(controllerName, actionName, req, res, next) {

	// The routing directions
	var routePlan;

	// Traverse policy tree to determine where to route this request
	var controller = sails.config.policies[controllerName];
	if(controller && (!_.isUndefined(controller[actionName]) || !_.isUndefined(controller['*']))) {
		var action = controller[actionName];
		if(!_.isUndefined(action)) {
			// If a function was specified, run it as the policy middleware
			if(_.isFunction(action)) {
				routePlan = action;
			}
			// If an object was specified, use the policy key
			else if(_.isObject(action)) {
				routePlan = action.policy;
			}
			// If true was specified, always allow
			else if(action === true) {
				routePlan = function(req, res, next) {
					next();
				};
			}
			// If false was specified, always deny
			else if(action === false) {
				routePlan = function(req, res, next) {
					res.send(403);
				};
			} 
			// Look up proper policy by name
			else if (_.isString(action)) {
				routePlan = action;
			}
			// Unknown policy
			else {
				var message = "Invalid entry ("+action+") in policy configuration! Controller: " + controllerName + "\nAction: " + actionName;
				sails.log.error(action,"::",message);
				return res.send(message, 500);
			}

		} else {
			// Use controller default
			routePlan = controller['*'];
		}
	} else {
		// Use app default
		routePlan = !_.isUndefined(sails.config.policies['*']) ? sails.config.policies['*'] : true;
	}

	// Route or reroute if necessary
	reroute(routePlan, req, res, next);
}


// Reroute as a result of access control
function reroute(routePlan, req, res, next) {
	// If routePlan is boolean, allow or deny from all accordingly
	if(routePlan === true) {
		next();
	}
	// if the routePlan is a function, treat it as basic policy middleware
	else if(_.isFunction(routePlan)) {
		routePlan(req, res, next);
	}
	// If a string was specified, lookup the appropriate policy
	else if (_.isString(routePlan)) {
		var plan = sails.policies[routePlan.toLowerCase()];
		if (plan) plan(req,res,next);
		else throw new Error('Trying to use unknown policy ('+routePlan+').  Please check your configuration in policies.js, and make sure any string policies you specify have a matching file in /api/policies.');
	}
	// Support multiple policies applied in a list
	else if (_.isArray(routePlan)) {
		require('async').forEach(routePlan, function (item,cb) {
			// Recursively call reroute() for each one
			reroute(item,req,res,function () { cb(); });
		}, function (err) {
			if (err) return res.send(err,500);
			next();
		});
	}

}
