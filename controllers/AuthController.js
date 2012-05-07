_.extend(exports,{
	
	// Login to an Account
	login: function (req,res) {
		var secretAttempt = req.body && req.body.secret;

		if (secretAttempt) {
			
			Account.find({
				where: {
					password: secretAttempt
				}
			}).success(function (account) {
				
				if (account) {
					// Store authenticated state in session
					AuthenticationService.session.link(req,account);
					AuthenticationService.session.redirectToOriginalDestination(req,res);
				}
				else {
					// Unknown user
					res.render('auth/login', {
						title: 'Login | Sails Framework',
						loginError: (secretAttempt && secretAttempt.length>0) ? 'That password is incorrect.' : null
					});
				}
			}).error(function() {
				debug.error("An error occured while logging in!");
			});
		}
		else {
			res.render('auth/login', {
				loginError: (secretAttempt && secretAttempt.length>0) ? 'Please specify a password.' : null
			});
		}
	},
	
	
	// Logout of an Account
	logout: function (req,res,next) {
		req.session.reroutedFrom = null;
		AuthenticationService.session.unlink(req);
		res.redirect('/login');
	},
	
	
	
	// Register for an Account
	register: function (req,res) {
		var attempt = req.body && req.body.submitted;
		
		// Register new account object
		if (attempt) {
			
			var account = Account.create ({
				username:req.body.username,
				password:req.body.password
			}).success(function(){
				debug.debug("REGISTRATION SUCCEEDED and user logged in.");
				
				AuthenticationService.session.link(req,account);
				req.flash("Your account was registered successfully!");
				res.redirect('/');
			})
			.error(function() {
				debug.debug("REGISTRATION FAILED!!!!");
				
				req.flash("An error occured while processing your registration.");
				res.redirect('/register');
			});
		}
		else {
			res.render('auth/register', {
				title: 'Register | Sails Framework',
				validationErrors: {
					secret: (attempt && req.body.password.length > 0) ? 'Validation errors.' : undefined
				}
			});
		};
	},
	
	
	// Register as an admin
	registerAdmin: function (req,res) {
		var attempt = req.body && req.body.submitted;
		
		// Register new account object
		if (attempt) {
			
			var account = Account.create ({
				username:req.body.username,
				password:req.body.password
			}).success(function(a){
				a.setRoleByName('admin',function(){
					debug.debug("REGISTRATION SUCCEEDED and user logged in.");		

					AuthenticationService.session.link(req,a);
					req.flash("Your account was registered successfully!");
					res.redirect('/');
				});
			})
			.error(function() {
				debug.debug("REGISTRATION FAILED!!!!");
				
				req.flash("An error occured while processing your registration.");
				res.redirect('/register');
			});
		}
		else {
			res.render('auth/registerAdmin', {
				title: 'Register | Sails Framework',
				validationErrors: {
					secret: (attempt && req.body.password.length > 0) ? 'Validation errors.' : undefined
				}
			});
		};
	}
	
});