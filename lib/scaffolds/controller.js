exports.definition = function (modelName) {
	var Model = global[_.str.capitalize(modelName)];
	return {
		// Call findAll, unless this is a basic request, then render the index view
		index: function (req,res) {
			if (req.isAjax || req.isSocket) {
				this.read(req,res);
			}
			else {
				res.view();
			}
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
				options.where = [" FALSE "];
				_.each(req.param('search'),function(queryString,queryField) {
					
					// Verify the field name actually exists in the model (since it won't be escaped)
					var modelFields = _.keys(Model.rawAttributes);
					if (_.include(modelFields,queryField)) {
						// Append SQL and escaped variable to the WHERE query string
						options.where[0] += " OR " + queryField+" LIKE ?";
						options.where.push("%"+queryString+"%");
					}
				});
			}
			else {
				options.where = req.param('where') || (req.param('id') && {id:req.param('id')}) || undefined;
			}
			
			Model.findAll(options).success(function(models) {
				Model.subscribe(req,res);

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

			Model.create(Model.trimParams(params)).success(function(model) {
				Model.publish(req,res,{
					uri: Model.getModelName()+'/create',
					data: model.values
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

			Model.findAndUpdate({
				id: req.param('id') 
			}, Model.trimParams(params), function (err,model) {
				if (_.isArray(model)) {
					model = model[0];
				}
				try {
					if (!model || !model.values) throw new Error('Model cannot be found.');
					
					// Trim updatedAt from values to avoid having to use a null binding on the client
					var changes = _.objReject(model.values,function(v,k) {
						return k === 'updatedAt';
					});
					
					Model.publish(req,res,{
						uri: Model.getModelName()+'/'+req.param('id')+'/update',
						data: changes
					});
					res.json({
						id: +req.param('id'),
						success:true
					});
				}
				catch(e) {
					res.json({
						success: false,
						error: e
					});
				}
			});
		},

		// Destroy a model
		destroy: function (req,res) {
			Model.findAndDelete(req.param('id'),function(err) {
				Model.publish(req,res,{
					uri: Model.getModelName()+'/'+req.param('id')+'/destroy'
				});
				res.json({
					id: +req.param('id'),
					success:true
				});
			});
		}
	};
};