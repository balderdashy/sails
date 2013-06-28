module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash');

	/**
	 * CRUD destroy() blueprint
	 *
	 * @api private
	 */

	return function destroy (req, res, next) {

		var controllerId = req.param('controller');
		var id = req.param('id');

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.config.hooks.orm && sails.models[controllerId];
		if (!Model) {
			return next();
		}

		if (!id) {
			sails.log.error('No id provided.');
			if (sails.config.environment === 'development') {
				return res.send(400, 'No id provided.');
			}
			else return res.send(400);
		}

		// Ensure that id is numeric (unless this check is disabled)
		if (sails.config.controllers.blueprints.expectIntegerId) {
			var castId = +id;
			if (id && _.isNaN(castId)) {

				// If it's not, move on to next middleware
				// but emit a console warning explaining the situation if the app is in development mode:
				if (sails.config.environment === 'development') {
					sails.log.warn('\n',
								'Just then, you were prevented from being routed \n',
								'to the `destroy` blueprint for controller: ' + controllerId + ' using `id='+id+'`.\n',
								'This is because REST blueprint routes expect natural number ids by default, and so the `destroy()` middleware was skipped- \n',
								'If you\'d like to disable this restriction, you can do so by setting \n',
								'sails.config.controllers.blueprints.expectIntegerId = false');
				}
				return next();
			}
		}


		// Create monolithic parameter object
		var params = _.extend(req.query || {}, req.params || {}, req.body || {});

		// If a view exists, and this isn't an JSONy request,
		// render and pass down model as "model"
		var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);

		// If this is a GET, and showing the view is appropriate, just serve the view
		if (req.method === 'GET' && showView) {
			return res.view();
		}

		// Otherwise, find and destroy the model in question
		Model.findOne(id).done(function(err, result) {
			if(err) return res.send(err, 500);
			if(!result) return res.send(404);

			Model.destroy(id, function(err) {
				if(err) return res.send(err, 500);

				// If the model is silent, don't use the built-in pubsub
				// (also ignore pubsub logic if the hook is not enabled)
				if (sails.config.hooks.pubsub && !Model.silent) {
					Model.publishDestroy(result);
				}

				// Respond with model which was destroyed
				return res.json(result);
			});
		});
	};

};
