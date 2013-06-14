module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _		= require('lodash'),
		async	= require('async'),
		util	= require('../../util');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function find (req, res, next) {

		var controllerId = req.param('controller');
		var id = req.param('id');

		// Ensure that id is numeric (unless this check is disabled)
		if (sails.config.controllers.blueprints.expectIntegerId) {
			var castId = +id;
			if (id && _.isNaN(castId)) {

				// If it's not, move on to next middleware
				// but emit a console warning explaining the situation if the app is in development mode:
				if (sails.config.environment === 'development') {
					sails.log.warn('\n',
								'Just then, you were prevented from being routed \n',
								'to the `find` blueprint for controller: ' + controllerId + ' using `id='+id+'`.\n',
								'This is because REST blueprint routes expect integer ids by default, and so the `find()` middleware was skipped- \n',
								'If you\'d like to disable this restriction, you can do so by setting \n',
								'sails.config.controllers.blueprints.expectIntegerId = false');
				}
				return next();
			}
		}


		console.log(controllerId, id);
		res.send('find');
	};

};
