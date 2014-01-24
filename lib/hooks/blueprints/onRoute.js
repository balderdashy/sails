/**
 * Module dependencies.
 */

var _ = require('lodash'),
	util = require('sails-util');


/**
 * Expose route parser.
 * @type {Function}
 */
module.exports = function (sails) {


	return interpretRouteSyntax;



	/**
	 * interpretRouteSyntax
	 * 
	 * "Teach" router to understand direct references to blueprints
	 * as a target to sails.router.bind()
	 * (i.e. in the `routes.js` file)
	 * 
	 * @param  {[type]} route [description]
	 * @return {[type]}       [description]
	 * @api private
	 */
	function interpretRouteSyntax (route) {
		var target = route.target,
			path = route.path,
			verb = route.verb,
			options = route.options;

		if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target)) {
		
			// Support referencing blueprints in explicit routes
			// (`{ blueprint: 'create' }` et. al.)
			if (_.isString(target.blueprint)) {
				return bindBlueprint(path, target, verb, options);
			}

		}

		// Ignore unknown route syntax
		// If it needs to be understood by another hook, the hook would have also received
		// the typeUnknown event, so we're done.
		return;
	}



	/**
	 * Bind route to a blueprint
	 * 
	 * @param  {[type]} path   [description]
	 * @param  {[type]} target [description]
	 * @param  {[type]} verb   [description]
	 * @param  {[type]} options   [description]
	 * @return {[type]}        [description]
	 * @api private
	 */
	function bindBlueprint ( path, target, verb, options ) {

		// Normalize blueprint referencee
		var controllerId = util.normalizeControllerId(target.controller);
		var actionId = _.isString(target.action) ? target.action.toLowerCase() : null;

		// Look up appropriate controller/action and make sure it exists
		var controller = sails.middleware.controllers[controllerId];

		// Fall back to matching view
		if (!controller) {
			controller = sails.middleware.views[controllerId];
		}

		// If a 'blueprint' was specified, 
		// but it's not a match, warn the user
		if ( ! ( controller && _.isObject(controller) )) {
			sails.log.error(
				controllerId,
				':: Ignoring attempt to bind route (' + path + ') to unknown controller.'
			);
			return;
		}

		// Merge leftover items in the target object into our `options`:
		options = _.merge(options, _.omit(target, 'blueprint'));

		
		// -- or --

		// 2. Bind a controller which is actually a function to the destination route (rare)
		sails.router.bind(path, controllerHandler(subTarget), verb, target);

		

		return;
	}

};
