/**
 * Module dependencies.
 */

// global: sails

var _		= require( 'lodash' ),
	util	= require( '../../util' );


/**
 * Expose Hook constructor
 */

module.exports = Hook;


/**
 * Instantiate Hook
 *
 * @returns array for use in async.auto loader
 * @api public
 */

function Hook ( ) {
	return Hook.prototype.dependencies.concat([ Hook.prototype.load ]);
}



Hook.prototype.initialize = function () {

	// Start iterating through controllers
	_.each(sails.controllers, function (controller, controllerId) {

		// Instead of using the actual controller definition,
		// look up the version in the middleware registry, 
		// since it might have policies attached
		controller = sails.middleware[controllerId];

		// If a controller is the middleware itself, 
		// create a route for it directly, then bail out
		if (_.isFunction(controller) || _.isArray(controller) ) {
			Hook.prototype.routes.after['/' + controllerId] = controller;
			return;
		}
		
		// Build routes for each action
		_.each(controller, function (target, actionId) {
			
			// If this isn't a valid target, bail out
			if (! (_.isFunction(target) || _.isArray(target)) ) {
				sails.log.warn('Action ('+actionId+') in "'+controllerId+'" could not be dynamically routed because it isn\'t an array or a function.');
				return;
			}

			// Check for verb in actionId
			var detectedVerb = util.detectVerb(actionId);
			actionId = detectedVerb.original;
			var verb = detectedVerb.verb;

			// If a verb is set, the prefix looks like `get /`
			// otherwise, it's just a trailing slash
			var prefix = verb ? verb + ' /' : '/';

			// Bind dynamic routes
			if (actionId === 'index') {
				Hook.prototype.routes.after[prefix + controllerId] = target;
			}
			Hook.prototype.routes.after[prefix + controllerId + '/' + actionId] = target;

		}, this);
		
	}, this);


	// If the views hook is enabled, also auto-bind views
	if (sails.config.hooks.views) {

		// If there are any matching views which don't have an action
		// create middleware to serve them
		_.each(sails.views, function (view, controllerId) {

			// Create middleware for a top-level view
			if (view === true) {
				Hook.prototype.routes.after['/' + controllerId] = sails.middleware[controllerId];
				return;
			}

			// Create middleware for each subview
			else {
				// Build routes for each action
				for (var actionId in sails.views[controllerId]) {

					if (actionId === 'index') {
						Hook.prototype.routes.after['get /' + controllerId] = sails.middleware[controllerId][actionId];
					}
					Hook.prototype.routes.after['get /' + controllerId + '/' + actionId] = sails.middleware[controllerId][actionId];
				}
			}

		}, this);
	}
};



/**
 * Register routes with router
 *
 * @returns array for use in async.auto loader
 * @api public
 */

Hook.prototype.load = function (cb) {

	// Call initialize() method if one provided
	Hook.prototype.initialize && Hook.prototype.initialize();

	// Bind routes before any of the static app routes
	sails.router.on('route:before', function () {
		_.each(Hook.prototype.routes.before, function (middleware, route) {
			sails.router.bind(route, middleware);
		});
	});

	// Bind routes after the static app routes
	sails.router.on('route:after', function () {
		_.each(Hook.prototype.routes.after, function (middleware, route) {
			sails.router.bind(route, middleware);
		});
	});

	// Reload the router so our new routes get bound
	sails.router.flush();

	cb();
};


/**
 * Other hooks that must be loaded before this one
 */

Hook.prototype.dependencies = ['router'];
	
	

/**
* Middleware that available as part of the public API
*/

Hook.prototype.middleware = {},


/**
 * Routes to bind before or after routing
 */

Hook.prototype.routes = {
	
	before: {},

	after: {}
};




