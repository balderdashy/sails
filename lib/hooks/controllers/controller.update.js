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

	return function update (req, res, next) {

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}

		
		// Locate and validate id parameter
		var id = idHelper(req.param('id'), req.target.controller, 'update');
		if (!id) {
			return res.badRequest('No id provided.');
		}


		// Create monolithic parameter object
		var params = req.params.all();
		var clonedParams = util.clone(params);

		// Parse JSON-API patch operations
		if (sails.config.controllers.blueprints.jsonAPI && req.is('application/json-patch+json')) {
			clonedParams = {};
			if (!(req.body instanceof Array)) {
				return res.badRequest('Invalid JSON-API request');
			}
			var path = '/' + pluralize(Model.identity) + '/0/';
			req.body.forEach(function (op) {
				if (op.op !== 'replace' || op.path.indexOf(path) !== 0) {
					return res.badRequest('Invalid JSON-API request');
				}
				var keys = op.path.replace(path, '').split('/');
				if (keys.length !== 1) {
					return res.badRequest('Invalid JSON-API request');
				}
				clonedParams[keys[0]] = op.value;
			});
		}


		// Otherwise find and update the models in question
		Model.update(id, clonedParams, function(err, models) {
			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			if(!models || models.length === 0) return res.notFound();

			// Because this should only update a single record and update
			// returns an array, just use the first item
			var model = models[0],
				value = model.toJSON();

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.hooks.pubsub && !Model.silent) {
				Model.publishUpdate(model.id, value); // req.socket
			}

			// Otherwise serve a JSON API
			

			if (sails.config.controllers.blueprints.jsonAPI) {
				value = jsonAPIHelper(Model, [value]);
			}

			if ( sails.config.controllers.blueprints.jsonp ) {
				return res.jsonp(value);
			}
			else {
				return res.json(value);
			}
		});
	};

};
