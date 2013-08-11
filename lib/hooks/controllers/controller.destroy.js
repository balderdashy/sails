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
		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}
		
		var id = idHelper(req.param('id'), req.target.controller, 'destroy');
		if (!id) {
			return next('400 Bad Request: No id provided.');
		}


		// Create monolithic parameter object
		var params = util.extend(req.query || {}, req.params || {}, req.body || {});

		if (!id) {
			return next('400 Bad Request: No id provided.');
		}

		// Otherwise, find and destroy the model in question
		Model.findOne(id).done(function(err, result) {
			if(err) return next(err);
			if(!result) return next();

			Model.destroy(id, function(err) {
				if(err) return next(err);

				// If the model is silent, don't use the built-in pubsub
				// (also ignore pubsub logic if the hook is not enabled)
				if (sails.hooks.pubsub && !Model.silent) {
					Model.publishDestroy(result.id, req.socket);
				}

				// Respond with model which was destroyed
				return res.json(result);
			});
		});
	};

};
