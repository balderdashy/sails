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
		res.render('403',{title:'Access Denied'});
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
		// Access denied
		res.redirect('/');
	}
}


/**
 * Check whether the logged-in user is of a specific type
 */
exports.only = function(type) {
	return function (req,res,next) {
		// Remember where the user was trying to go so she can be redirected back
		req.session.reroutedFrom = req.url;
	
		if (req.session.authenticated && req.session.type == type) {
			next();
		}
		else {
			res.render('403',{title:'Access Denied'});
		}
	}
}