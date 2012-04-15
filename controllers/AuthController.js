_.extend(exports,AuthController = {
	
	// Login to an Account
	login: function (req,res,next) {
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
					AuthenticationService.session.redirectToOriginalDestination(req,res,next);
				}
				else {
					// Unknown user
					res.render('auth/login', {
						title: 'Login | Sails Framework',
						loginError: (secretAttempt && secretAttempt.length>0) ? 'That password is incorrect.' : undefined
					});
				}
			}).error(function() {
				debug.error("An error occured while logging in!");
			});
		}
		else {
			res.render('auth/login', {
				title: 'Login | Sails Framework',
				loginError: (secretAttempt && secretAttempt.length>0) ? 'Please specify a password.' : undefined
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
	register: function (req,res,next) {
		var attempt = req.body && req.body.submitted;
	
		// Register and log in as a particular role
		var registerAs = "user";
	
		// Register new account object
		if (attempt) {
			
			var account = Account.build ({
				username:req.body.username,
				password:req.body.password
			}),
			role = Role.build ({
				name: registerAs
			});
			
			new Sequelize.Utils.QueryChainer()
			.add(account.save())
			.add(role.save())
			.add(account.setRoles([role]))
			.runSerially()
			.success(function(){
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
	}
	
});