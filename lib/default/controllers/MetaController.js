var MetaController = {
	
	// Optionally identify the controller here
	// Otherwise name will be based off of filename
	// CASE-INSENSITIVE
	id: 'meta',
	
	home: function (req,res) {
		res.view(__dirname+'/../views/home');
	},

	error: function (req,res) {
		res.view(__dirname+'/../views/500', {
			title: 'Error (500)'
		});
	},

	notfound: function (req,res) {
		res.view(__dirname+'/../views/404', {
			title: 'Not Found (404)'
		});
	},

	denied: function (req,res) {
		res.view(__dirname+'/../views/403', {
			title: 'Access Denied (403)'
		});
	}
};
_.extend(exports,MetaController);