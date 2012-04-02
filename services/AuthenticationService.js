/////////////////////////////////////////////////
// BUILT-IN AUTH MIDDLEWARE
/////////////////////////////////////////////////
/**
 * Check nothing
 */
exports.none = function (req,res,next) {
	next();
}

/**
 * Check whether the user is logged in AT ALL
 */
exports.any = function (req,res,next) {
	// Remember where the user was trying to go so she can be redirected back
	req.session.reroutedFrom = req.url;
	console.log(req.session);
	
	if (req.session.authenticated) {
		next();
	}
	else {
		res.redirect('/403');
	}
	
}

/**
 * Check whether the user is *NOT* logged in AT ALL
 */
exports.inverse = function (req,res,next) {
	if (!req.session.authenticated) {
		next();
	}
	else {
		res.redirect('/');
	}
}