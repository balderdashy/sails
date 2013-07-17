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
		// If no model exists, move on to the next middleware
		var Model = sails.config.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}

		// Create monolithic parameter object
		var params = util.extend(req.query || {}, req.params || {}, req.body || {});


		Model.create(params, function(err, model) {
			if (err) return next(err);

			// If the model is silent, don't use the built-in pubsub
			// (also ignore pubsub logic if the hook is not enabled)
			if (sails.config.hooks.pubsub && !Model.silent) {
				Model.publishCreate(model.toJSON(), req.socket);
			}

			// Otherwise return JSON
			return res.json(model.toJSON());
		});
	};

};
