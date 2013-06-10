/**
 * Module dependencies.
 */

// global: sails

var _ = require( 'lodash' );


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
	return Hook.dependencies.concat([ Hook.prototype.load ]);
}



/**
 * Register routes with router
 *
 * @returns array for use in async.auto loader
 * @api public
 */

Hook.prototype.load = function (cb) {

	// Register a route to be bound before any of the app routes
	_.each(Hook.routes, function (middleware, route) {
		sails.router.register( route, middleware );
	});

	// Reload the router so our new routes get bound
	sails.router.flush();

	cb();
};


/**
 * Other hooks that must be loaded before this one
 */

Hook.dependencies = ['router'];
	
	

/**
* Middleware that available as part of the public API
*/

Hook.middleware = {
	view: function (req,res) {
		res.view();
	}
},


/**
 * Routes that will be automatically bound before any of the app routes
 */

Hook.routes = {

	/**
	 * For all routes:
	 *
	 * Adds res.view() method (an enhanced version of res.render) to response object
	 * res.view() automatically renders the appropriate view based on the calling middleware's source route
	 * Note: the original function is still accessible via res.render()
	 * 
	 * @middleware
	 * @api private
	 */
	'*': function addResViewMethod ( req, res, next ) {

		res.view = function (specifiedPath, data, fun) {
			data = data || {};

			// By default, generate a path to the view using what we know about the controller+action
			var path = req.entity + "/" + req.action;

			// If the path to a view was explicitly specified, use that
			if(_.isString(specifiedPath)) {
				path = specifiedPath;
			}
			// If a map of data is provided as the first argument, use it (and just use the default path)
			else if(_.isObject(specifiedPath)) {
				data = specifiedPath;
			}

			res.render(path, data, fun);
		};

		next();
	}
};




