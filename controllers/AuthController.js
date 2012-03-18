
exports.login = function (req, res, next ) {
	
	var secret = "abc123",
		secretAttempt = req.body && req.body.secret,
		secretCorrect = secretAttempt && secret == secretAttempt;
	
	if (secretCorrect) {
		
		// Store authenticated state in session
		req.session.authenticated = true;
		
		res.redirect('/');
	}
	else if (secretAttempt && secretAttempt.length>0) {
		res.render('auth/login', {
			title: 'Login | crud.io',
			loginError: 'That secret is incorrect.'
		});
	}
	else {
		res.render('auth/login', {
			title: 'Login | crud.io'
		});
	}
}

exports.logout = function (req, res, next ) {
	
	// Log user out if session exists
	req.session.authenticated = false;
	res.redirect('/');
}

/////////////////////////////////////////////////
// AUTH MIDDLEWARE
// TODO: extract this into a framework-side thing
/////////////////////////////////////////////////
/**
 * Check nothing
 */
exports.none = function (req,res,next) {
	next();
}

/**
 * Check whether the user has basic auth
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
 * Check whether the user is NOT logged in
 */
exports.reverse = function (req,res,next) {
	if (!req.session.authenticated) {
		next();
	}
	else {
		res.redirect('/');
	}
}