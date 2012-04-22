_.extend(exports,{
	
	// Optionally identify the controller here
	// Otherwise name will be based off of filename
	// CASE-INSENSITIVE
	id: 'meta',
	
	home: function () {
		this.render();
	},

	error: function () {
		this.render('500', {
			title: 'Error (500)'
		});
	},

	notfound: function () {
		this.render('404', {
			title: 'Not Found (404)'
		});
	},

	denied: function () {
		this.render('403', {
			title: 'Access Denied (403)'
		});
	}
});