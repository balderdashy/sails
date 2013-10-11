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
			return res.badRequest('No id provided.');
		}

		// Otherwise, find and destroy the model in question
		Model.findOne(id).done(function(err, result) {

			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			if (!result) return res.notFound();

			Model.destroy(id, function(err) {
				// TODO: differentiate between waterline-originated validation errors
				//			and serious underlying issues
				// TODO: Respond with badRequest if an error is encountered, w/ validation info
				if (err) return res.serverError(err);

				// If the model is silent, don't use the built-in pubsub
				// (also ignore pubsub logic if the hook is not enabled)
				if (sails.hooks.pubsub && !Model.silent) {
					Model.publishDestroy(result.id); // req.socket
				}

				// Interlace app-global `config.controllers` with this controller's `_config`
				var controllerConfig = util.merge({}, 
					sails.config.controllers, 
					sails.controllers[req.target.controller]._config || {});
				
				// Respond with JSON or JSONP
				if ( controllerConfig.jsonp ) {
					return res.jsonp(result);
				}
				else {
					return res.json(result);
				}
			});
		});
	};

};
