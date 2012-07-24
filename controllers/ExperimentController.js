var ExperimentController = {
	
	index: function (req,res) {
		console.log("INDEX");
		if (req.xhr) {
			return this.findAll();
		}
		else {
			console.log(req.params.id);
			res.view();
		}
	},
	
	
	// Lookup a single model
	find: function (req,res) {
		Experiment.find({where:{id: req.param('id')}}).success(function(experiments) {
			res.json(experiments);
		});
	},
	
	// Fetch paginated list of models from testtable
	findAll: function (req,res) {
		console.log("FINDALL");
		Experiment.fetch(null,function(experiments) {
			res.json(experiments);
		});
	},
	
	// Store a new model
	create: function (req,res) {
		Experiment.create({
			title: req.param('title'),
			value: req.param('value')
		}).success(function(outcome) {
			res.json({success:true});
		});
	},
	
	// Edit an existing model
	update: function (req,res) {
		Experiment.find({where:{id: req.param('id')}}).success(function(outcome) {
			res.json({success:true});
		});
	},
	
	destroy: function (req,res) {
		var id = req.param('id');
		
		Experiment.find(id).success(function(experiment) {
			console.log("THEOUTCOME::::",experiment);
			experiment.destroy().success(function(outcome){
				res.json({
					success:true
				});
			});
		});
	},
	
	
	testjson: function (req,res) {
		res.json({
			stuff: "there it is!",
			things: "and more things"
		});
	}
};
_.extend(exports,ExperimentController);