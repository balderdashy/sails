module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */

	var _		= require('lodash'),
		async	= require('async'),
		util	= require('../../util');


	/**
	 * CRUD find() blueprint
	 *
	 * @api private
	 */

	return function find (req, res, next) {

		var controllerId = req.param('controller');
		var id = req.param('id');

		// Grab model class based on the controller this blueprint comes from
		// If no model exists, move on to the next middleware
		var Model = sails.models && sails.models[controllerId];
		if (!Model) {
			return next();
		}

		// Ensure that id is numeric (unless this check is disabled)
		if (sails.config.controllers.blueprints.expectIntegerId) {
			var castId = +id;
			if (id && _.isNaN(castId)) {

				// If it's not, move on to next middleware
				// but emit a console warning explaining the situation if the app is in development mode:
				if (sails.config.environment === 'development') {
					sails.log.warn('\n',
								'Just then, you were prevented from being routed \n',
								'to the `find` blueprint for controller: ' + controllerId + ' using `id='+id+'`.\n',
								'This is because REST blueprint routes expect integer ids by default, and so the `find()` middleware was skipped- \n',
								'If you\'d like to disable this restriction, you can do so by setting \n',
								'sails.config.controllers.blueprints.expectIntegerId = false');
				}
				return next();
			}
		}

		
		/**
		 * If a valid id was specified, find that model in particular
		 *
		 */

		if (id) {
			
			Model.findOne(req.param('id')).done(function(err, model) {

				// An error occurred
				if(err) return res.send(err, 500);

				// Model not found
				if(!model) return res.send(404);

				// If the model is silent, don't use the built-in pubsub
				if (!Model.silent) {

					// Subscribe to the models that were returned
					Model.subscribe(req, model);
				}

				// If a view exists, and this isn't an JSONy request,
				// pass down model as "model"
				if (res.viewExists && !(req.isAjax || req.isSocket || req.isJson)) return res.view({
					model: model.toJSON()
				});

				// Otherwise serve a JSON API
				return res.json(model.toJSON());
			});
		}


		/**
		 * If no id was specified, find models using the criteria passed in as params
		 *
		 */

		else {

			var where = req.param('where');

			// If WHERE is a string, try to interpret it as JSON
			if (_.isString(where)) {
				where = tryToParseJSON(where);
			}

			// If WHERE has not been specified, but other params ARE specified build the WHERE option using them
			var params;
			if (!where) {
				params = _.extend(req.query || {}, req.params || {}, req.body || {});

				// Remove undefined params
				// (as well as limit, skip, and sort)
				// to build a proper where query
				params = sails.util.objReject(params, function (param, key) {
					return _.isUndefined(param) ||
						key === 'limit' || key === 'skip' || key === 'sort';
				});

				where = params;
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

				// An error occurred
				if(err) return res.send(err, 500);

				// No models found
				if(!models) return res.send(404);

				// If the model is silent, don't use the built-in pubsub
				if (!Model.silent) {

					// Subscribe to the models that were returned
					Model.subscribe(req, models);
				}

				// Build set of model values
				var modelValues = [];

				models.forEach(function(model) {
					modelValues.push(model.toJSON());
				});

				// If a view exists, and this isn't an JSONy request,
				// render it and pass down models as "models"
				var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);
				if (showView) return res.view({
					models: modelValues
				});

				// Otherwise serve a JSON API
				return res.json(modelValues);
			});
		}


		// Attempt to parse JSON
		// If the parse fails, return the error object
		// If JSON is falsey, return null
		// (this is so that it will be ignored if not specified)
		function tryToParseJSON (json) {
			if (!_.isString(json)) return null;
			try {
				return JSON.parse(json);
			}
			catch (e) {
				return e;
			}
		}

	};

};
