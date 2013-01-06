/**
* Allow any authenticated user.
*/
module.exports = function (req,res,ok) {
	
	if (req.session.authenticated) {
		ok();
	}
	else {
		res.send(403);
	}
};