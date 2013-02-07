exports.definition = function(modelName) {
	var Model = sails.models[modelName];
	var actions = {
		// Call findAll, unless this is a basic request, then render the index view
		index: function(req, res) {
			if(req.isAjax || req.isSocket || req.isJson) {
				if(req.param('id')) actions.find(req, res);
				else actions.findAll(req, res);
			} else res.view();
		},

		// Fetch a single model from testtable
		find: function(req, res) {
			if(!req.param('id')) return res.send(404);
			Model.find(req.param('id')).done(function(err, model) {
				if(err) return res.send(err, 500);
				else if(!model) return res.send(404);
				else return res.json(model);
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
				params = applyFilter(req.param("sails_filter"),params,Model);

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
			console.log(options);

			// Respond to queries
			var finding = Model.findAll(options);

			finding.done(function afterFound(err, models) {
				if(err) return res.send(err, 500);
				if(!models) return res.send(404);

				// Subscribe to the models that were returned
				Model.subscribe(req, models);

				return res.json(models);
			});
		},


		// Store a new model
		create: function(req, res) {
			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});
			params = applyFilter(req.param("sails_filter"),params, Model);

			Model.create(params).done(function(err, model) {
				if(err) return res.send(err, 500);

				// Broadcast success message
				Model.publish(req, null, {
					uri: Model.identity + '/create',
					data: model
				});

				// Since we just added a new model, we need to subscribe
				// all users currently in the class room to its updates
				Model.introduce(req, model.id);

				// Respond with model
				res.json(model);
			});
		},

		// Edit an existing model
		update: function(req, res) {
			var id = req.param('id');
			if(!id) return res.send('No id specified!');

			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});
			params = applyFilter(req.param("sails_filter"),params, Model);

			// Ignore id in params
			delete params['id'];

			Model.update({
				id: id
			}, params, function(err, model) {
				if(err) return res.send(err, 500);
				if(!model) return res.send('Model cannot be found.', 404);

				// Broadcast success message
				Model.publish(req, [{
					id: id
				}], {
					uri: Model.identity + '/' + req.param('id') + '/update',
					data: model
				});

				// Publish update
				res.json(model);
			});
		},

		// Destroy a model
		destroy: function(req, res) {
			// Create monolithic parameter object
			var params = _.extend(req.query || {}, req.params || {}, req.body || {});

			var id = req.param('id');
			if(!id) return res.send(404);

			Model.find(id).done(function(err, model) {
				if(err) return res.send(err, 500);
				if(!model) return res.send(404);

				Model.destroy(id, params).done(function(err) {
					if(err) return res.send(err, 500);

					// Broadcast success message
					Model.publish(req, [{
						id: id
					}], {
						uri: Model.identity + '/' + req.param('id') + '/destroy'
					});

					// Respond with model which was destroyed
					res.json(model);
				});
			});
		}
	};

	return actions;
};

// If "sails_filter" is explicitly enabled, filter the parameters
// (really useful for when a client's view-model is bundled in the same object as its api model)
// (e.g. Mast or Backbone.js)
function applyFilter (sails_filter, data, Model) {
	if (!data || !_.isObject(data)) return data;

	// Always remove the params which sails automatically includes
	delete data['action'];
	delete data['entity'];
	delete data['controller'];

	// If the 'sails_filter' param is set,
	// remove the attributes which are not in the model
	// (but leave 'where', 'limit', 'skip', and 'sort' alone)
	if (sails_filter) return _.extend({
		where: data.where,
		limit: data.limit,
		sort: data.sort,
		skip: data.skip
	}, Model.filter(data));
	else return data;
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

