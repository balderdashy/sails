module.exports = {
	verb: function(req, res) {
		res.send(req.route.method);
	},

	dynamic: function(req, res) {
		res.send(req.route.keys);
	},

	index: function(req, res) {
		res.send('index');
	},

	find: function(req, res) {
		res.send('find');
	},

  findOne: function(req, res) {
    res.send('findOne');
  },

	create: function(req, res) {
		res.send('create');
	},

	update: function(req, res) {
		res.send('update');
	},

	destroy: function(req, res) {
		res.send('destroy');
	},

	CapitalLetters: function(req, res) {
		res.send('CapitalLetters');
	}
};
