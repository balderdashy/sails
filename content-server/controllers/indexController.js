var db = require('../model').db;

exports.index = function (req, res, next ) {
	res.render('index', {
		title: 'crud.io'
	});
}
