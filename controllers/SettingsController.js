_.extend(exports,{
	

	index: function (req,res) {
		res.view();

	},
	
	testjson: function (req,res) {
		res.json({
			stuff: "there it is!",
			things: "and more things"
		});
	}
});