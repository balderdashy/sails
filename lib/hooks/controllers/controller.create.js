module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var idHelper = require('./helpers/id')(sails),
		jsonAPIHelper = require('./helpers/jsonApi')(sails),
		pluralize = require('pluralize'),
		util = require('../../util');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function create (req, res, next) {

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, pretend this blueprint doesn't exist and call next middleware
		var Model = sails.config.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}
		
		// Create monolithic parameter object
		var params = req.params.all();

		if (sails.config.controllers.blueprints.jsonAPI) {
			params = params[pluralize(Model.identity)];
		} else {
			params = [params];
		}

		// Create model using params
		Model.createEach(params, function(err, models) {
			
			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.config.hooks.pubsub && !Model.silent) {
				models.forEach(function(model) {
					Model.publishCreate(model.toJSON()); // req.socket
				});
			}

			// Build set of model values
			var modelValues = [];

			models.forEach(function(model) {
				modelValues.push(model.toJSON());
			});

			if (sails.config.controllers.blueprints.jsonAPI) {
				value = jsonAPIHelper(Model, modelValues);
			} else {
				value = modelValues[0];
			}

			// Otherwise return JSON
			if ( sails.config.controllers.blueprints.jsonp ) {
				return res.jsonp(value);
			}
			else {
				return res.json(value);
			}
		});
	};

};
