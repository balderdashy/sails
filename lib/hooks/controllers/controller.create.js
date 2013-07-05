module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _ = require('lodash');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function create (req, res, next) {
		var controllerId = req.param('controller');

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.config.hooks.orm && sails.models[controllerId];
		if (!Model) {
			return next();
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

		Model.create(params, function(err, model) {
			if(err) return res.send(err, 500);

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.config.hooks.pubsub && !Model.silent) {
				Model.publishCreate(model.toJSON());
			}

			// Otherwise return JSON
			return res.json(model.toJSON());
		});
	};

};
