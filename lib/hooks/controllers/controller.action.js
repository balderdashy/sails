module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash'),
		async = require('async'),
		util = require('../../util');


	/**
	 * Route a request resourcefully based on the available controllers/actions
	 *
	 * @api private
	 */

	return function autoRoute (req, res, next) {

		var controllerId	= req.param('controller');
		var actionId		= req.param('action') || 'index';

		// Look up the controller in the middleware registry
		var controller = sails.middleware.controllers[controllerId];

		// If the controller is a middleware function, call it directly and bail out
		if ( _.isFunction(controller) ) {
			return middlewareFn(req, res, next);
		}
		// If controller is invalid, issue warning and call next middleware
		else if ( ! _.isObject(controller) ) {
			return next();
		}

		
		// First check if any actions match this request's HTTP verb
		// e.g. `put someAction`
		var actionIdWithVerb = req.route.method + ' ' + actionId;
		if ( _.isFunction (controller[actionIdWithVerb]) ) {
			return controller[actionIdWithVerb](req, res, next);
		}
		// If not, try just the action name
		// e.g. `someAction`
		else if ( _.isFunction(controller[actionId]) ) {
			return controller[actionId](req, res, next);
		}
		// If nothing matches the requested action, call next middleware & bail out
		else return next();

		// Bind dynamic routes for actions
		return controller[actionId](req, res, next);

	};

};
