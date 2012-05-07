_.extend(exports,{
	

	index: function (req,res) {
		res.render();

	},

	summary: function (req,res) {
		res.render();
	},



	detail: function (req,res) {
		res.render();
	},
	
	
	testjson: function (req,res) {
		res.json({
			stuff: "there it is!",
			things: "and more things"
		});
	}
});