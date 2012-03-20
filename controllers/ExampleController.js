
exports.index = function (req, res, next ) {
	res.render('example', {
		title: 'example'
	});
}

exports.summary = function (req, res, next ) {
	res.render('example', {
		title: 'example/summary'
	});
}

exports.detail = function (req, res, next ) {
	res.render('example', {
		title: 'example/detail'
	});
}