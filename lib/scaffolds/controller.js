exports.definition = function (modelName) {
	var Model = global[_.str.capitalize(modelName)];
	return {
		// Call findAll, unless this is a basic request, then render the index view
		index: function (req,res) {
			if (req.xhr || req.isSocket) {
				this.findAll();
			}
			else {
				res.view();
			}
		},
		
		// Fetch paginated list of models from testtable
		read: function (req,res) {
			var options = {};
			if (req.param('id')) {
				options.where = {
					id: req.param('id')
				};
			}
			options.where = req.param('id') ? {id:req.param('id')} : undefined;
			options.limit = req.param('limit') || undefined;
			options.offset= req.param('offset') || undefined;
			options.order= req.param('order') || undefined;
			
			Model.findAll(options).success(function(models) {
				Model.subscribe(req,res);
				res.json(models);
			});
		},

		// Store a new model
		create: function (req,res) {
			Model.create(Model.trimParams(req.params)).success(function(model) {
				Model.publish(req,res,{
					uri: Model.getModelName()+'/create',
					data: model.values
				})
				res.json({
					id: model.id,
					success:true
				});
			});
		},

		// Edit an existing model
		update: function (req,res) {
			Model.findAndUpdate({
				id: req.param('id') 
			}, Model.trimParams(req.params), function (err,model) {
				if (_.isArray(model)) {
					model = model[0];
				}
				try {
					if (!model || !model.values) throw new Error('Model cannot be found.');
					Model.publish(req,res,{
						uri: Model.getModelName()+'/'+req.param('id')+'/update',
						data: model.values
					});
					res.json({
						success:true
					});
				}
				catch(e) {
					res.json({
						success: false,
						error: e
					})
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
					success:true
				});
			});
		}
	}
};