_.extend(exports,{
	
	// Optionally identify the controller here
	// Otherwise name will be based off of filename
	// CASE-INSENSITIVE
	id: 'meta',
	
	home: function (req,res) {

		res.render('meta/home');
	},

	error: function (req,res) {
		res.render('500', {
			title: 'Error (500)'
		});
	},

	notfound: function (req,res) {
		res.render('404', {
			title: 'Not Found (404)'
		});
	},

	denied: function (req,res) {
		res.render('403', {
			title: 'Access Denied (403)'
		});
	}
});