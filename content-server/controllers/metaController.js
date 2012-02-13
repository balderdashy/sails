exports.home = function (req, res, next ) {
	res.render('index', {
		title: 'crud.io'
	});
}

exports.error = function (req, res, next ) {
	res.render('index', {
		title: 'Error (500) | crud.io'
	});
}

exports.notfound = function (req, res, next ) {
	res.render('index', {
		title: 'Not Found (404) | crud.io'
	});
}