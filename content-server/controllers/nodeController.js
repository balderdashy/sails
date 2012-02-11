exports.index = function (req, res, next ){
	res.render('index', {
		title: 'Manage Content | crud.io'
	});
}

exports.view = function (req, res, next ){
	res.render('view', {
		title: 'Edit Content Node | crud.io'
	});
}