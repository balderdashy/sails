
exports.login = function (req, res, next ) {
	console.log("STATE:",req.session);
	
	var secret = "abc123",
		stakeholderSecret = "roganchrisadam1",
		secretAttempt = req.body && req.body.secret,
		secretCorrectForAdmin = secretAttempt && secret == secretAttempt,
		secretCorrectForStakeholder = secretAttempt && stakeholderSecret == secretAttempt;
	
	if (secretCorrectForAdmin) {
		
		// Store authenticated state in session
		req.session.authenticated = true;
		req.session.role = "developer";
		res.redirect('/');
	}
	else if (secretCorrectForStakeholder) {
				
		// Store authenticated state in session
		req.session.authenticated = true;
		req.session.role = "stakeholder";
		
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

