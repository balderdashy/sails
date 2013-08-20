module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var util		= require('../../../util');


	/**
	 * @param {Natural|String} id
	 * @param {String} controllerId
	 * @param {String} actionId
	 * @returns id ::
	 *		If `id` is undefined, no `id` was provided
	 *		If `id` is false, `id` is invalid, and probably unintentional
	 *		Otherwise, `id` is valid and probably intentional
	 */
	return function validId (id, controllerId, actionId) {

		// The other CRUD methods are special reserved words-- in which case we always pass
		// As long as the CRUD 'shortcut' blueprints are enabled, you cannot search for models
		// with an id of 'find', 'update', 'create', or 'destroy'
		var routeConf = sails.config.controllers.blueprints;
		if (	sails.config.controllers.blueprints.shortcuts && (
				id === 'find'   ||
				id === 'update' ||
				id === 'create' ||
				id === 'destroy' )) {
			return false;
		}

		// If expectIntegerId check is disabled, `id` is always ok
		if ( !sails.config.controllers.blueprints.expectIntegerId ) {
			return id;
		}

		// Ensure that id is numeric (unless this check is disabled)
		var castId = +id;
		if (id && util.isNaN(castId)) {

			// If it's not, move on to next middleware
			// but emit a console warning explaining the situation
			// (if the app is in development mode):
			if (sails.config.environment === 'development') {
				sails.log.warn('\n',
							'Just then, you were prevented from being routed \n',
							'to the `' + actionId + '` blueprint for controller: ' + controllerId + 
							' using `id='+id+'`.\n',
							'This is because REST blueprint routes expect natural number ids by default, '+
							'and so the `' + actionId + '()` middleware was skipped- \n',
							'If you\'d like to disable this restriction, you can do so by setting \n',
							'sails.config.controllers.blueprints.expectIntegerId = false');
			}
			return false;
		}

		// Id is an integer
		return id;
	};
};

