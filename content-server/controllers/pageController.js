exports.index = function (req, res, next ){
	
	// Fetch paginated page index
	res.render('page/index', {
		title: 'Manage Pages | crud.io',
		selected:'page'
	});
}

exports.view = function (req, res, next ){
	
	// Fetch detailed information about a specific page
	res.render('page/view', {
		title: 'Edit Page | crud.io'
	});
}