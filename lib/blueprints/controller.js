exports.definition = function(modelName) {
	var Model = sails.models[modelName];
	var actions = {

		// Fetch a single model from testtable
		find: function(req, res) {
			// No id specified
			if(!req.param('id')) return res.send('No id specified!', 404);
			Model.find(req.param('id')).done(function(err, model) {

				// An error occurred
				if(err) return res.send(err, 500);
				
				// Model not found
				else if(!model) return res.send(404);

				// Subscribe to the models that were returned
				Model.subscribe(req, model);

				// If a view exists, and this isn't an JSONy request, 
				// pass down model as "model"
				if (res.viewExists && !(req.isAjax || req.isSocket || req.isJson)) return res.view({
					model: model.values
				});

				// Otherwise serve a JSON API
				else return res.json(model.values);
			
			});
		},

		// Fetch paginated list of models from testtable
		findAll: function(req, res) {
			
			var where = req.param('where');

			// If WHERE is a string, try to interpret it as JSON
			if (_.isString(where)) {
				where = sails.parseJSON(where);
			}

			// If WHERE has not been specified, but other params ARE specified build the WHERE option using them
			var params;
			if (!where) {
				params = _.extend(req.query || {}, req.params || {}, req.body || {});
				params = applyFilter(req.param("sails_filter") || req.param('param_filter'),params,Model);

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
			var finding = Model.findAll(options);

			finding.done(function afterFound(err, models) {
				
				// An error occurred
				if(err) return res.send(err, 500);

				// No models found
				if(!models) return res.send(404);

				// Subscribe to the models that were returned
				Model.subscribe(req, models);

				// Build set of model values
				var modelValues = _.map(models, function (model) {
					return model.values;
				});

				// If a view exists, and this isn't an JSONy request, 
				// render it and pass down models as "models"
				var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);
				if (showView) return res.view({
					models: modelValues
				});

				// Otherwise serve a JSON API
				else return res.json(modelValues);
			});
		},


		// Store a new model
		create: function(req, res) {
			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});
			params = applyFilter(req.param("sails_filter") || req.param('param_filter'),params, Model);

			// If a view exists, and this isn't an JSONy request, 
			// render and pass down model as "model"
			var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);

			// If this is a GET, and showing the view is appropriate, just serve the view
			if (req.method === 'GET' && showView) {
				return res.view();
			}

			
			else if (req.param('id')) {
					return res.send("Id's are not allowed to be passed during create.");
			}

			// Otherwise create model and serve JSON
			else {
					Model.create(params).done(function(err, model) {
					if(err) return res.send(err, 500);

					// Broadcast success message
					Model.publish(req, null, {
						uri: Model.identity + '/create',
						data: model.values
					});

					// Since we just added a new model, we need to subscribe
					// all users currently in the class room to its updates
					Model.introduce(req, model.id);

					// If redirect was provided, use it
					if (!handleRedirect(req,res)) {

						// Otherwise return JSON
						return res.json(model.values);
					}
				});

			}
		},

		// Edit an existing model
		update: function(req, res) {
			var id = req.param('id');
			if(!id) return res.send('No id specified!');

			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});
			params = applyFilter(req.param("sails_filter") || req.param('param_filter'),params, Model);

			// Ignore id in params
			delete params['id'];

			// If a view exists, and this isn't an JSONy request, 
			// render and pass down model as "model"
			var showView = res.viewExists && !(req.isAjax || req.isSocket || req.isJson);
			
			// If this is a GET, and showing the view is appropriate, just serve the view
			if (req.method === 'GET' && showView) {
				return res.view();
			}

			// Otherwise find and update the model in question
			else Model.update(id, params, function(err, model) {
				if(err) return res.send(err, 500);
				if(!model) return res.send('Model cannot be found.', 404);

				// Publish update
				Model.publish(req, [{
					id: id
				}], {
					uri: Model.identity + '/' + req.param('id') + '/update',
					data: model.values
				});

				// If redirect was provided, use it
				if (!handleRedirect(req,res)) {

					// Otherwise return JSON
					return res.json(model.values);
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
			else Model.find(id).done(function(err, model) {
				if(err) return res.send(err, 500);
				if(!model) return res.send(404);

				Model.destroy(id, function(err) {
					if(err) return res.send(err, 500);

					// Broadcast success message
					Model.publish(req, [{
						id: id
					}], {
						uri: Model.identity + '/' + req.param('id') + '/destroy',
						data: model.values
					});

					// Respond with model which was destroyed

					// If redirect was provided, use it
					if (!handleRedirect(req,res)) {

						// Otherwise return JSON
						return res.json(model.values);
					} 
				});
			});
		}
	};

	return actions;
};

// If "sails_filter" or "param_filter" is explicitly enabled, filter the parameters
// (really useful for when a client's view-model is bundled in the same object as its api model)
// (e.g. Mast or Backbone.js)
function applyFilter (sails_filter, data, Model) {
	if (!data || !_.isObject(data)) return data;

	var params = _.clone(data);

	// Always remove the params which sails automatically includes
	delete params['action'];
	delete params['entity'];
	delete params['controller'];

	// Always remove 'redirect'
	delete params['redirect'];

	// If the 'sails_filter' param is set,
	// remove the attributes which are not in the model
	// (but leave 'where', 'limit', 'skip', and 'sort' alone)
	if (sails_filter) return _.extend({
		where: params.where,
		limit: params.limit,
		sort: params.sort,
		skip: params.skip
	}, Model.filter(params));
	else return params;
}

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

