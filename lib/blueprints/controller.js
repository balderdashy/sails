var _ = require('lodash');

exports.definition = function(modelName) {
	var Model = sails.models[modelName];
	var actions = {

		// Fetch a single model from testtable
		findOne: function(req, res) {
			// No id specified
			if(!req.param('id')) return res.send('No id specified!', 404);

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
		},

		// Fetch paginated list of models from testtable
		find: function(req, res) {

			var where = req.param('where');

			// If WHERE is a string, try to interpret it as JSON
			if (_.isString(where)) {
				where = sails.parseJSON(where);
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
		},


		// Store a new model
		create: function(req, res) {

			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});

			// If a view exists, and this isn't an JSONy request,
			// render and pass down model as "model"
			var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);

			// If this is a GET, and showing the view is appropriate, just serve the view
			if (req.method === 'GET' && showView) {
				return res.view();
			}

			Model.create(params, function(err, model) {
				if(err) return res.send(err, 500);

				// If the model is silent, don't use the built-in pubsub
				if (!Model.silent) {
					Model.publishCreate(model.toJSON());
				}

				// If redirect was provided, use it
				if (!handleRedirect(req,res)) {

					// Otherwise return JSON
					return res.json(model.toJSON());
				}
			});
		},

		// Edit an existing model
		update: function(req, res) {
			var id = req.param('id');
			if(!id) return res.send('No id specified!');

			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});

			// Ignore id in params
			delete params['id'];

			// If a view exists, and this isn't an JSONy request,
			// render and pass down model as "model"
			var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);

			// If this is a GET, and showing the view is appropriate, just serve the view
			if (req.method === 'GET' && showView) {
				return res.view();
			}

			// Otherwise find and update the models in question
			Model.update(id, params, function(err, models) {
				if(err) return res.send(err, 500);
				if(!models) return res.send('Model cannot be found.', 404);

				// Because this should only update a single record and update
				// returns an array, just use the first item
				var model = models[0];

				// If the model is silent, don't use the built-in pubsub
				if (!Model.silent) {
					Model.publishUpdate(id, model.toJSON());
				}

				// If redirect was provided, use it
				if (!handleRedirect(req,res)) {

					// Otherwise return JSON
					return res.json(model.toJSON());
				}
			});
		},

		// Destroy a model
		destroy: function(req, res) {
			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});

			var id = req.param('id');
			if(!id) return res.send("No id provided.",404);

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
					if (!Model.silent) {
						Model.publishDestroy(result);
					}

					// Respond with model which was destroyed

					// If redirect was provided, use it
					if (!handleRedirect(req,res)) {

						// Otherwise return JSON
						return res.json(result);
					}
				});
			});
		}
	};

	return actions;
};

// Take care of a redirect, if it was provided
// Returns false if no redirect was provided
function handleRedirect(req,res) {
	// If redirect provided, use it
	if (req.param('redirect')) {

		// TODO: sanitize redirect
		res.redirect(req.param('redirect'));

		return true;
	}
	else return false;
}


// Attempt to parse JSON
// If the parse fails, return the error object
// If JSON is falsey, return null
// (this is so that it will be ignored if not specified)
sails.parseJSON = function (json) {
	if (!_.isString(json)) return null;
	try {
		return JSON.parse(json);
	}
	catch (e) {
		return e;
	}
};

