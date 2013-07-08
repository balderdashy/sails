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

	return function destroy (req, res, next) {

		// Locate and validate id parameter
		var id = idHelper(req.param('id'), req.target.controller, 'destroy');
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

		if (!id) {
			sails.log.error('No id provided.');
			if (sails.config.environment === 'development') {
				return res.send(400, 'No id provided.');
			}
			else return res.send(400);
		}

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
