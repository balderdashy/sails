module.exports = function(req, res){
	return res.json({_csrf: res.locals._csrf});
}