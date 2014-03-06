module.exports = {

	watch: function(req, res) {
		User.watch(req);
		res.send(200);
	},

	message: function(req, res) {
		User.findOne({user_id:1}, function(err, user) {
			User.message(user, {greeting: 'hello'}, req);
			res.send(200);
		});
	},

	subscribe: function(req, res) {
		User.subscribe(req, {user_id:req.param('id')}, req.param('context'));
		res.send(200);
	}


};