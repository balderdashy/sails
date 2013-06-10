/**
 * Module dependencies.
 */

// global: sails

var _ = require( 'lodash' );

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

	// Reference sails logger
	this.log = sails.log;
}


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

	// Use specified path to bind static routes
	_.each(this.staticRoutes, function (target, path) {
		this.bind(path, target);
	}, this);

	// Start iterating through controllers
	// _.each(sails.controllers, function (controller, controllerId) {

	// 	// Instead of using the actual controller definition,
	// 	// look up the version in the middleware registry, 
	// 	// since it might have policies attached
	// 	controller = sails.middleware[controllerId];
		
	// 	// Build path to bind to dynamic routes
	// 	var actions = _.functions(controller);
	// 	_.each(actions, function (target, actionId) {
	// 		var path = '/'+controllerId + '/'+actionId;

	// 		sails.log.verbose('Binding resourceful route for (', path, ') with target: ',target);

	// 		// Bind special route for views/controllers
	// 		this.bind(path, target);
	// 	}, this);
		
	// }, this);

	// Add in last-resort 404 handler
	// todo

	// Add in last-resort 500 handler
	// todo
};
