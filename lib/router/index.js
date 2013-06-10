/**
 * Module dependencies.
 */

// global: sails

var _		= require( 'lodash' ),
	util	= require( '../util');

/**
 * Expose `Router` constructor.
 */

module.exports = Router;



/**
 * Initialize a new `Router`
 *
 * @param {Object} options
 * @api private
 */

function Router ( options ) {

	// Maintain a reference to our Express app
	// (oh man, AMD would really make sense here.)
	this.app = sails.express.app;

	// Maintain a reference to the static route config
	this.staticRoutes = sails.config.routes;

	// Remember routes that were preregistered for the next flush()
	this.preregisteredRoutes = [];

	// Reference sails logger
	this.log = sails.log;
}


/**
 * Register a new route to be bound as soon as possible (before app routes)
 * during the next flush()
 */

Router.prototype.register = function ( route, middleware ) {
	this.preregisteredRoutes.push({
		route: route,
		middleware: middleware
	});
};



/**
 * Bind new route(s)
 *
 * @param {String|RegExp} path
 * @param {String|Object|Array|Function} bindTo
 * @param {String} verb
 * @api private
 */

Router.prototype.bind = require( './bind' );


/**
 * Unbind all routes currently attached to the router
 *
 * @param {String} verb
 * @api private
 */
Router.prototype.reset = function ( verb ) {
	if (!verb) {

		// Reset the routes for each HTTP method
		return _.each(this.app.routes, function ( routes, method ) {
			this.reset(method);
		}, this);
	}
	this.app.routes[verb] = [];
};


/**
 * Wipe everything and bind routes, in order of descending preference:
 *
 * -> static routes (routes config)
 * -> resourceful/view routes (config + middleware table)
 * -> fire afterRoute blueprint routes (blueprint config + middleware table)
 * -> default 404 handler
 * -> default 500 handler
 *
 * @api private
 */

Router.prototype.flush = function ( ) {

	this.reset();

	// Before routing any app code, bind preregistered routes
	_.each(this.preregisteredRoutes, function (preregistration) {
		this.bind(preregistration.route, preregistration.middleware);
	}, this);

	// Use specified path to bind static routes
	_.each(this.staticRoutes, function (target, path) {
		this.bind(path, target);
	}, this);


	////////////////////////////////////////////////////////////////////////
	// TODO: pull this into a plugin
	////////////////////////////////////////////////////////////////////////

	// Start iterating through controllers
	_.each(sails.controllers, function (controller, controllerId) {

		// Instead of using the actual controller definition,
		// look up the version in the middleware registry, 
		// since it might have policies attached
		controller = sails.middleware[controllerId];

		// If a controller is the middleware itself, 
		// create a route for it directly, then bail out
		if (_.isFunction(controller) || _.isArray(controller) ) {
			this.bind('/' + controllerId, controller);
			return;
		}
		
		// Build routes for each action
		_.each(controller, function (target, actionId) {
			
			// If this isn't a valid target, bail out
			if (! (_.isFunction(target) || _.isArray(target)) ) {
				this.log.warn('Action ('+actionId+') in "'+controllerId+'" could not be dynamically routed because it isn\'t an array or a function.');
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
				this.bind(prefix + controllerId, target);
			}
			this.bind(prefix + controllerId + '/' + actionId, target);

		}, this);
		
	}, this);
	////////////////////////////////////////////////////////////////////////


	// If there are any matching views which don't have an action
	// create middleware to serve them
	_.each(sails.views, function (view, controllerId) {

		// Create middleware for a top-level view
		if (view === true) {
			this.bind('/' + controllerId, sails.middleware[controllerId]);
			return;
		}

		// Create middleware for each subview
		else {
			// Build routes for each action
			for (var actionId in sails.views[controllerId]) {

				if (actionId === 'index') {
					this.bind('get /' + controllerId, sails.middleware[controllerId][actionId]);
				}
				this.bind('get /' + controllerId + '/' + actionId, sails.middleware[controllerId][actionId]);
			}
		}

	}, this);
};



/**
 * Attach middleware to mixin route metadata to req object
 *
 * @param {String|RegExp} path
 * @param {String|Object|Array|Function} bindTo
 * @param {String} verb
 * @api private
 */

Router.prototype.mixinRouteData = function ( path, target, verb ) {

	this.app[verb || 'all'](path, function (req, res, next) {
		
		// Set routing metadata
		req.target = target;
		req.controller = target.controller;
		req.action = target.action || 'index';

		// For backwards compatibility:
		req.entity = target.controller;
		next();
	});
};
