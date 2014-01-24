/**
 * Module dependencies.
 */

var _ = require('lodash'),
	util = require('sails-util');



// NOTE:
// Since controllers load blueprint actions by default anyways, this route syntax handler
// can be replaced with `{action: 'find'}, {action: 'create'}, ...` etc.


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

		// Support referencing blueprints in explicit routes
		// (`{ blueprint: 'create' }` et. al.)
		if (
			_.isObject(target) &&
			!_.isFunction(target) &&
			!_.isArray(target) &&
			_.isString(target.blueprint)) {

			// On a match, merge leftover items in the target object into route options:
			options = _.merge(options, _.omit(target, 'blueprint'));
			return bindBlueprintAction(path, target.blueprint, verb, options);
		}

		// Ignore unknown route syntax
		// If it needs to be understood by another hook, the hook would have also received
		// the typeUnknown event, so we're done.
		return;
	}



	/**
	 * Bind explicit route to a blueprint action.
	 * 
	 * @param  {[type]} path   [description]
	 * @param  {[type]} blueprintActionID [description]
	 * @param  {[type]} verb   [description]
	 * @param  {[type]} options   [description]
	 * @return {[type]}        [description]
	 * @api private
	 */
	function bindBlueprintAction ( path, blueprintActionID, verb, options ) {

		// Look up appropriate blueprint action and make sure it exists
		var blueprint = sails.middleware.blueprints[blueprintActionID];

		// If a 'blueprint' was specified, but it doesn't exist, warn the user and ignore it.
		if ( ! ( blueprint && _.isFunction(blueprint) )) {
			sails.log.error(
				blueprintActionID,
				':: Ignoring attempt to bind route (' + path + ') to unknown blueprint action (`'+blueprintActionID+'`).'
			);
			return;
		}

		sails.router.bind(path, blueprint, verb, options);

		return;
	}

};
