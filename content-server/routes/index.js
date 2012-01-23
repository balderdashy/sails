
/*
 * GET home page.
 */
exports.index = function(req, res){
	console.log("CONNETION!");
	res.render('index', {
		title: 'Express'
	})
};

exports.read = require("./read").read;