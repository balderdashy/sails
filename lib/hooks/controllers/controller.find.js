module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var idHelper = require('./helpers/id')(sails),
		jsonAPIHelper = require('./helpers/jsonApi')(sails),
		util = require('../../util');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function find (req, res, next) {

		// Locate and validate id parameter
		var id = idHelper(req.param('id'), req.target.controller, 'find');
		if (id === false) {
			// Id was invalid-- and probably unintentional.
			// Continue on as if this blueprint doesn't exist
			return next();
		}

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.hooks.orm && sails.models[req.target.controller];
		if (!Model) {
			return next();
		}

		
		/**
		 * If a valid id was specified, find that model in particular
		 *
		 */

		if (id) {
			
			Model.findOne(id).done(function(err, model) {

				// TODO: differentiate between waterline-originated validation errors
				//			and serious underlying issues
				// TODO: Respond with badRequest if an error is encountered, w/ validation info
				if (err) return res.serverError(err);

				// Model not found
				if(!model) return res.notFound();

				// If the model is silent, don't use the built-in pubsub
				// (also ignore pubsub logic if the hook is not enabled)
				if (sails.config.hooks.pubsub && !Model.silent) {

					// Subscribe to the models that were returned
					Model.subscribe(req.socket, model);
				}

				// Otherwise serve a JSON API
				var value = model.toJSON();

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
		}


		/**
		 * If no id was specified, find models using the criteria passed in as params
		 *
		 */

		else {

			var where = req.param('where');

			// If WHERE is a string, try to interpret it as JSON
			if (util.isString(where)) {
				where = tryToParseJSON(where);
			}

			// If WHERE has not been specified, but other params ARE specified build the WHERE option using them
			var params;
			if (!where) {
				
				// Build monolithic parameter object
				params = req.params.all();

				// Pluck params:
				params = sails.util.objReject(params, function (param, key) {

					// if req.transport is falsy or doesn't contain the phrase "socket"
					// we'll call it "jsonpCompatible"
					var jsonpCompatible = ! ( req.transport && req.transport.match(/socket/i) );

					// undefined params
					return util.isUndefined(param) ||

						// and limit, skip, and sort
						key === 'limit' || key === 'skip' || key === 'sort' ||

						// and JSONP callback (if this is jsonpCompatible)
						(key === 'callback' && jsonpCompatible) ||

						// and JSON-API ids key if it's turned on
						(key === 'ids' && sails.config.controllers.blueprints.jsonAPI);
				});

				// to build a proper where query
				where = params;
			}

			// JSON-API ids query support - array or comma-separated string of ids
			if (sails.config.controllers.blueprints.jsonAPI) {
				var ids = req.param('ids');
				if (ids) {
					if (util.isString(ids)) {
						ids = ids.split(',');
					}
					where = where || {};
					where.or = [];
					ids.forEach(function (id) {
						where.or.push({id: id});
					});
				}
			}

			// Build options object
			var options = {
				limit: req.param('limit') || undefined,
				skip: req.param('skip') || req.param('offset') || undefined,
				sort: req.param('sort') || req.param('order') || undefined,
				where: where || undefined
			};

			// Respond to queries
			var finding = Model.find(options);

			finding.done(function afterFound(err, models) {

				// TODO: differentiate between waterline-originated validation errors
				//			and serious underlying issues
				// TODO: Respond with badRequest if an error is encountered, w/ validation info
				if (err) return res.serverError(err);

				// No models found
				if(!models) return res.notFound();

				// If the model is silent, don't use the built-in pubsub
				if (sails.config.hooks.pubsub && !Model.silent) {

					// Subscribe to the collection itself
					// (listen for `create`s)
					Model.subscribe(req.socket);

					// Subscribe to the models that were returned
					// (listen for `updates` and `destroy`s)
					Model.subscribe(req.socket, models);
				}

				// Build set of model values
				var modelValues = [];

				models.forEach(function(model) {
					modelValues.push(model.toJSON());
				});

				if (sails.config.controllers.blueprints.jsonAPI) {
					modelValues = jsonAPIHelper(Model, modelValues);
				}

				// Otherwise serve a JSON API
				if ( sails.config.controllers.blueprints.jsonp ) {
					return res.jsonp(modelValues);
				}
				else {
					return res.json(modelValues);
				}
			});
		}


		// Attempt to parse JSON
		// If the parse fails, return the error object
		// If JSON is falsey, return null
		// (this is so that it will be ignored if not specified)
		function tryToParseJSON (json) {
			if (!util.isString(json)) return null;
			try {
				return JSON.parse(json);
			}
			catch (e) {
				return e;
			}
		}

	};

};
