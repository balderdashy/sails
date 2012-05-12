_.extend(exports,{
	

	index: function (req,res) {
		console.log(req.params.id);
		res.view();
	},
	
	testjson: function (req,res) {
		res.json({
			stuff: "there it is!",
			things: "and more things"
		});
	}
});