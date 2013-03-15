// router.js
// --------------------
//
// Determine a controller and action given a URL.
// Below, we start with the explicit routing table, then
// use a handful of different strategies to come up with
// sensible assumptions about where the URL should route by default.

/**
 * Functionality to apply Sails.js enhancements to an Express request
 */
var enhanceRequest = require('./request');

/**
 * Listen for network requests using bindRouteFn
 */
function listen(bindRouteFn) {
	startHandlingMappedRequests(bindRouteFn);
	startHandlingWildcardRequests(bindRouteFn);
}

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
function fetchRoute(url, verb) {

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
		var routeObj = sails.util.parsePath(target);

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
}


/**
 * Handle a request
 */
function handleRequest(target) {
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
	else if(sails.util.isId(requestedAction)) {

		// Update request parameters accordingly
		req.params.id = requestedAction;

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

	sails.log.verbose("");
	sails.log.verbose("--- " + httpVerb + " "+req.url +" ---");
	sails.log.verbose("Entity: "+requestedEntity);
	sails.log.verbose("Action: "+requestedAction);
	sails.log.verbose("");

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
	require('./policies')(requestedEntity, actionName, req, res, function afterwards() {

		// After policy middleware is run, the main controller function can be run

		// If no index action exists for this controller, and no action is specified
		if (actionName === 'index' && !fn) {

			// Use find/findAll instead
			actionName = req.param('id') ? 'find' : 'findAll';
			fn = controller && controller[actionName];

			// (but dont override action param so it stays correct for view rendering)
			// req.params.action = actionName;

			// But still try to use 'index' view
			checkIfViewExists(requestedEntity, 'index', function (err, exists) {
				if (err) return res.send(err, 500);

				// If an index view exists, use it
				if (exists) {
					afterThat(err,exists, requestedEntity+'/index');
				}
				
				// otherwise try for a find/findAll view
				else checkIfViewExists(requestedEntity, actionName, afterThat);
			});
		}
		
		// Otherwise, just check once if the view exists
		else checkIfViewExists(requestedEntity, actionName, afterThat);

		// Determine if the view to render exists
		// viewPath is the path to the view (usually views/:entity/:action or views/:entity/index)
		function afterThat(err, exists, viewPath) {
			if (err) return res.send(err, 500);

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
				else if (res.viewExists) return runHandler(req, res, next, function (req,res,next) {

					// Render the default view
					res.view(viewPath);
				});

				// Respond with notFound/404 behavior
				else return runHandler(req, res, next);
			}
		}
	});
}

// Respond whether a view exists for the specified entity and action
function checkIfViewExists (entity, action, cb) {
	var pattern = sails.express.app.settings.views + "/" + entity + "/" + action + ".*";


	// If the proper view exists, go ahead and render it
	require("glob")(pattern, {}, function (err,matches) {
		if (err) return cb(err);

		// View exists
		else if (matches && matches.length) return cb(null, matches, entity+'/'+action);

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



// Export logic from module
module.exports = {
	listen: listen,
	enhance: enhanceRequest,
	fetchRoute: fetchRoute,
	handleRequest: handleRequest
};