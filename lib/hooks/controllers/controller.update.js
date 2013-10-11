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

		// Build monolithic parameter object
		params = req.params.all();

		// Don't include JSONP callback parameter as data
		params = util.objReject(params, function (param, key) {

			// if req.transport is falsy or doesn't contain the phrase "socket"
			// we'll call it "jsonpCompatible"
			var jsonpCompatible = ! ( req.transport && req.transport.match(/socket/i) );

			// undefined params
			return util.isUndefined(param) ||

				// and JSONP callback (if this is jsonpCompatible)
				(key === 'callback' && jsonpCompatible);
		});


		// Otherwise find and update the models in question
		Model.update(id, params, function(err, models) {
			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			if(!models || models.length === 0) return res.notFound();

			// Because this should only update a single record and update
			// returns an array, just use the first item
			var model = models[0];

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.hooks.pubsub && !Model.silent) {
				Model.publishUpdate(model.id, model.toJSON());
			}

			// Interlace app-global `config.controllers` with this controller's `_config`
			var controllerConfig = util.merge({}, 
				sails.config.controllers, 
				sails.controllers[req.target.controller]._config || {});

			if ( controllerConfig.jsonp ) {
				return res.jsonp(model.toJSON());
			}
			else {
				return res.json(model.toJSON());
			}
		});
	};

};
