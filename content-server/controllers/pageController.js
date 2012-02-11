exports.index = function (req, res, next ){
	res.render('index', {
		title: 'Manage Pages | crud.io'
	});
}

exports.view = function (req, res, next ){
	res.render('view', {
		title: 'Edit Page | crud.io'
	});
}