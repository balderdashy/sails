module.exports = {

	watch: function(req, res) {
		User.watch(req);
		res.send(200);
	},

	message: function(req, res) {
		User.message({id:1}, {greeting:'hello'}, req);
		res.send(200);
		// User.findOne(1, function(err, user) {
		// 	User.message(user, {greeting: 'hello'}, req);
		// 	res.json({});
		// });
	}

};