exports.definition = function (modelName) {
	var Model = sails.models[modelName];
	return {
		// Call findAll, unless this is a basic request, then render the index view
		index: function (req,res) {
			if (req.isAjax || req.isSocket) {
				this.read(req,res);
			}
			else res.view();
		},
		
		// Fetch paginated list of models from testtable
		read: function (req,res) {
			var options = {
				limit	: req.param('limit') || undefined,
				offset	: req.param('skip') || req.param('offset') || undefined,
				order	: req.param('order') || undefined
			};
			
			// Respond to search or where queries
			if (_.isObject(req.param('search'))) {
				// Create stub where query
				options.where = {
					or: []
				};

				// TODO: instead of ?search, allow search by attribute
				_.each(req.param('search'),function(queryString,queryField) {
					
					// Verify the field name actually exists in the model (since it won't be escaped)
					var modelFields = _.keys(Model.attributes);
					if (_.include(modelFields,queryField)) {
						var criterion = {
							like: {}
						};
						criterion.like[queryField] = queryString;
						options.where.or.push(criterion);
					}
				});
			}
			else {
				options.where = req.param('where') || (req.param('id') && {id:req.param('id')}) || undefined;
			}

			Model.find(options,function(err,models) {
				if (err) return res.send(500,err);

				// subscribe to the models that were returned
				Model.subscribe(req,models);

				// If id was set, only return one model
				if (models && models.length===1 && req.param('id')) {
					models = models[0];
				}
				res.json(models);
			});
		},

		// Store a new model
		create: function (req,res) {
			// Create monolithic parameter object
			var params = _.extend(req.query || {},req.params || {},req.body || {});

			Model.create(Model.filter(params),function(err,model) {
				if (err) return res.send(500,err);

				// Broadcast success message
				Model.publish(req,null,{
					uri: Model.identity+'/create',
					data: model
				});
				res.json({
					id: model.id,
					success:true
				});
			});
		},

		// Edit an existing model
		update: function (req,res) {
			// Create monolithic parameter object
			var params = _.extend(req.query || {},req.params || {},req.body || {});

			var id = req.param('id');

			Model.findAndUpdate({
				id: id
			}, Model.filter(params), function (err,model) {
				if (err) return res.send(500,err);
				if (_.isArray(model)) {
					model = model[0];
				}
				if (!model) return res.send(500,{error: 'Model cannot be found.'});
				
				// Trim updatedAt from values to avoid having to use a null binding on the client
				var changes = _.objReject(model,function(v,k) {
					return k === 'updatedAt';
				});
				
				
				// Broadcast success message
				Model.publish(req,[{id: id}],{
					uri: Model.identity+'/'+req.param('id')+'/update',
					data: changes
				});
				res.json({
					id: +req.param('id'),
					success:true
				});
			});
		},

		// Destroy a model
		destroy: function (req,res) {
			var id = req.param('id');
			Model.findAndDestroy(id,function(err) {
				if (err) return res.send(500,err);
				
				// Broadcast success message
				Model.publish(req,[{id: id}],{
					uri: Model.identity+'/'+req.param('id')+'/destroy'
				});
				res.json({
					id: +req.param('id'),
					success:true
				});
			});
		}
	};
};