var AdminController = {
	

	index: function (req,res) {
		res.json({
			things: "Admin stuff"
		});

	}
};
_.extend(exports,AdminController);