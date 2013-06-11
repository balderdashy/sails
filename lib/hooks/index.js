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
 * Default hook configuration
 *
 * @api private
 */

var defaultConfig = {

	// list of environments to run in, if empty defaults to all
	envs: []
};



/**
 * Register routes with router
 *
 * @returns array for use in async.auto loader
 * @api private
 */

Hook.load = function (cb) {

	var self = this;
	
	// Extend configs
	this.config = _.extend(defaultConfig, this.config);
	
	// Determine if should load based on config
	if ( this.config.envs.length > 0  && this.config.envs.indexOf(sails.config.environment) === -1) {
		return cb();
	}
	
	// Call initialize() method if one provided
	this.initialize && this.initialize();

	// // Bind routes before any of the static app routes
	// sails.router.on('route:before', function () {
	// 	_.each(self.routes.before, function (middleware, route) {
	// 		sails.router.bind(route, middleware);
	// 	});
	// });

	// // Bind routes after the static app routes
	// sails.router.on('route:after', function () {
	// 	_.each(self.routes.after, function (middleware, route) {
	// 		sails.router.bind(route, middleware);
	// 	});
	// });

	// // Reload the router so our new routes get bound
	// sails.router.flush();

	cb();
};



/**
 * Extend a new Hook and return a loading signature
 * 
 * @api private
 */

Hook.extend = function (properties) {
	var NewHook = _.extend({}, Hook, properties);
	_.bindAll(NewHook);
	return NewHook.signature;
};


/**
 *
 * @returns array for use in async.auto loader
 * @api private
 */

Hook.signature = function () {
	return this.dependencies.concat([ this.load ]);
};



/**
 * Expose Hook constructor
 */

module.exports = Hook;
