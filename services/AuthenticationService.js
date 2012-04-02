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
exports.basic = function (req,res,next) {
	if (req.session.authenticated) {
		next();
	}
	else {
		res.redirect('/login');
	}
	
}

/**
 * Check whether the user is *NOT* logged in AT ALL
 */
exports.reverse = function (req,res,next) {
	if (!req.session.authenticated) {
		next();
	}
	else {
		res.redirect('/');
	}
}