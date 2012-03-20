
exports.index = function (req, res, next ) {
	res.render('example', {
		title: 'example'
	});
}