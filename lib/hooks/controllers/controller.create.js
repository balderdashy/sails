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

	return function create (req, res, next) {

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, pretend this blueprint doesn't exist and call next middleware
		var Model = sails.config.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}
		
		// Create monolithic parameter object
		var params = req.params.all();
		
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

		// Create model using params
		Model.create(params, function(err, model) {
			
			// TODO: differentiate between waterline-originated validation errors
			//			and serious underlying issues
			// TODO: Respond with badRequest if an error is encountered, w/ validation info
			if (err) return res.serverError(err);

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.config.hooks.pubsub && !Model.silent) {
				Model.publishCreate(model.toJSON()); // req.socket
			}

			// Set status code (HTTP 201: Created)
			res.status(201);

			// Interlace app-global `config.controllers` with this controller's `_config`
			var controllerConfig = util.merge({}, 
				sails.config.controllers, 
				sails.controllers[req.target.controller]._config || {});
			
			// and respond with JSON or JSONP
			if ( controllerConfig.jsonp ) {
				return res.jsonp(model.toJSON());
			}
			else {
				return res.json(model.toJSON());
			}
		});
	};

};
