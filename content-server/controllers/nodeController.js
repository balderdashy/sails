var _ = require('underscore');

exports.index = function (req, res, next ) {		
		res.render('node/index', {
			title: 'Manage Content | crud.io',
			selected: 'node'
		});
}

exports.read = function (req, res, next ){
	console.log(req.params);
	res.json({
		params: req.params
	});
}

exports.update = function (req, res, next ){
	console.log(req.params);
	res.json({
		params: req.params
	});
}

exports.remove = function (req, res, next ){
	console.log(req.params);
	res.json({
		params: req.params
	});
}