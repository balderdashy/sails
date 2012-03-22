
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
			title: 'Login | Sails Framework',
			loginError: 'That secret is incorrect.'
		});
	}
	else {
		res.render('auth/login', {
			title: 'Login | Sails Framework'
		});
	}
}

exports.logout = function (req, res, next ) {
	
	// Log user out if session exists
	req.session.authenticated = false;
	res.redirect('/');
}

