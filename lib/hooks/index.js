/**
 * Module dependencies.
 */

// global: sails

var _		= require( 'lodash' );


/**
 * Define Hook
 *
 * 
 * @api private
 */

var Hook = {};


/**
 *
 * @returns array for use in async.auto loader
 * @api private
 */

Hook.signature = function () {
	return this.dependencies.concat([ this.load ]);
};


/**
 * Register routes with router
 *
 * @returns array for use in async.auto loader
 * @api private
 */

Hook.load = function (cb) {

	var self = this;

	// Call initialize() method if one provided
	this.initialize && this.initialize();

	// Bind routes before any of the static app routes
	sails.router.on('route:before', function () {
		_.each(self.routes.before, function (middleware, route) {
			sails.router.bind(route, middleware);
		});
	});

	// Bind routes after the static app routes
	sails.router.on('route:after', function () {
		_.each(self.routes.after, function (middleware, route) {
			sails.router.bind(route, middleware);
		});
	});

	// Reload the router so our new routes get bound
	sails.router.flush();

	cb();
};



/**
 * Return a new Hook to extend
 * @api private
 */

Hook.extend = function (properties) {
	var NewHook = _.extend({}, Hook, properties);
	_.bindAll(NewHook);
	return NewHook;
};



/**
 * Expose Hook constructor
 */

module.exports = Hook;
