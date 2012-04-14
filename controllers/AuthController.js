
exports.login = function (req, res, next ) {	
	console.log(req.session);
	
	var secretAttempt = req.body && req.body.secret;
	
	if (secretAttempt) {
		Account.find({where: {password: secretAttempt}}).success(function (account) {
			
			if (account) {
				// Store authenticated state in session
				req.session.authenticated = true;
				req.session.type = "stakeholder";
				redirectToOriginalDestination(req,res,next);
			}
			else {
				// UNKNOWN USER
				res.render('auth/login', {
					title: 'Login | Sails Framework',
					loginError: (secretAttempt && secretAttempt.length>0) ? 'That password is incorrect.' : undefined
				});
			}
		}).error(function() {
			console.log("An error occured while logging in!");
		});
	}
	else {
		res.render('auth/login', {
			title: 'Login | Sails Framework',
			loginError: (secretAttempt && secretAttempt.length>0) ? 'Please specify a password.' : undefined
		});
	}
	
//	secretCorrectForAdmin = secretAttempt && ,
//	secretCorrectForStakeholder = secretAttempt && stakeholderSecret == secretAttempt;
//	
//	if (secretCorrectForAdmin) {
//		
//		// Store authenticated state in session
//		req.session.authenticated = true;
//		req.session.type = "developer";
//		
//		redirectToOriginalDestination(req,res,next);
//	}
//	else if (secretCorrectForStakeholder) {
//				
//		// Store authenticated state in session
//		req.session.authenticated = true;
//		req.session.type = "stakeholder";
//		
//		redirectToOriginalDestination(req,res,next);
//	}
//	else {
//		res.render('auth/login', {
//			title: 'Login | Sails Framework',
//			loginError: (secretAttempt && secretAttempt.length>0) ? 'That secret is incorrect.' : undefined
//		});
//	}
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
	// Clear reroutedFrom tracer
	req.session.reroutedFrom = null;
	// Log user out if session exists
	req.session.authenticated = false;
	res.redirect('/login');
}

exports.register = function (req, res, next ) {
	
	var attempt = req.body && req.body.submitted;
	
	// Register new account object
	if (attempt) {
		var account = Account.build({
			username:req.body.username,
			password:req.body.password
		});
		
		account.save().success(
			function successCallback() {
				console.log("SAVED!");
				req.flash("Registered new account!");
				res.redirect('/');
			}).error(
			function errorCallback () {
				console.log("Could not save new account!");
				res.redirect('/500');
			});
	}
	else {
		res.render('auth/register', {
			title: 'Register | Sails Framework',
			validationErrors: {
				secret: (attempt && req.body.length > 0) ? 'That secret is invalid.' : undefined
			}
		});
	}
}

