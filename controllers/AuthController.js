
exports.login = function (req, res, next ) {	
	
	var secret = "abc123",
		stakeholderSecret = "roganchrisadam1",
		secretAttempt = req.body && req.body.secret,
		secretCorrectForAdmin = secretAttempt && secret == secretAttempt,
		secretCorrectForStakeholder = secretAttempt && stakeholderSecret == secretAttempt;
	
	if (secretCorrectForAdmin) {
		
		// Store authenticated state in session
		req.session.authenticated = true;
		req.session.role = "developer";
		
		redirectToOriginalDestination(req,res,next);
	}
	else if (secretCorrectForStakeholder) {
				
		// Store authenticated state in session
		req.session.authenticated = true;
		req.session.role = "stakeholder";
		
		redirectToOriginalDestination(req,res,next);
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

// Handle routing back to original destination in session
// if no original destination is stored, redirect to home page
function redirectToOriginalDestination (req,res,next) {
	if (req.session.reroutedFrom) {
		res.redirect(req.session.reroutedFrom);
		req.session.reroutedFrom = null;
	}
	else {
		res.redirect('/');
	}
}

exports.logout = function (req, res, next ) {
	
	// Log user out if session exists
	req.session.authenticated = false;
	res.redirect('/');
}

