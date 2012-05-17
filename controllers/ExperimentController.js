var ExperimentController = {
	
	index: function (req,res) {
		console.log(req.params.id);
		res.view();
	},
	
	
	// Lookup a single model
	find: function (req,res) {
		Experiment.find({where:{id: req.param('id')}}).success(function(experiments) {
			res.json(experiments);
		});
	},
	
	// Fetch paginated list of models from testtable
	findAll: function (req,res) {
		Experiment.fetch(null,function(experiments) {
			res.json(experiments);
		});
	},
	
	// Store a new model
	create: function (req,res) {
		Experiment.create({
			name: "A NEW TEST",
			value: 99
		}).success(function(outcome) {
			res.json({
				success:true
			});
		});
	},
	
	// Edit an existing model
	update: function (req,res) {
		res.json({
			success:true
		});
	},
	
	destroy: function (req,res) {
		res.json({
			success:true
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