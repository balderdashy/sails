module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var idHelper = require('./helpers/id')(sails),
		util = require('../../util');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function update (req, res, next) {

		// Locate and validate id parameter
		var id = idHelper(req.param('id'), req.target.controller, 'update');
		if (!id) {
			sails.log.error('No id provided.');
			if (sails.config.environment === 'development') {
				return res.send(400, 'No id provided.');
			}
			else return res.send(400);
		}

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.config.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}

		// Create monolithic parameter object
		var params = util.extend(req.query || {}, req.params || {}, req.body || {});

		// Ignore id in params
		delete params['id'];

		// If a view exists, and this isn't an JSONy request,
		// render and pass down model as "model"
		var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);

		// If this is a GET, and showing the view is appropriate, just serve the view
		if (req.method === 'GET' && showView) {
			return res.view();
		}

		// Otherwise find and update the models in question
		Model.update(id, params, function(err, models) {
			if(err) return res.send(err, 500);
			if(!models) return res.send('Model cannot be found.', 404);

			// Because this should only update a single record and update
			// returns an array, just use the first item
			var model = models[0];

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.config.hooks.pubsub && !Model.silent) {
				Model.publishUpdate(id, model.toJSON());
			}

			return res.json(model.toJSON());
		});
	};

};
