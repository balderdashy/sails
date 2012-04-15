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
				console.log(account);
				
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
		req.session.authenticated = false;
		res.redirect('/login');
	},
	
	
	
	// Register for an Account
	register: function (req,res,next) {
		var attempt = req.body && req.body.submitted;
	
		// Register new account object
		if (attempt) {
			
			var account = Account.build ({
				username:req.body.username,
				password:req.body.password
			}),
			role = Role.build ({
				name: 'BASIC ROLE'
			});
			
			new Sequelize.Utils.QueryChainer()
			.add(account.save())
			.add(role.save())
			.add(account.setRoles([role]))
			.runSerially()
			.success(function(){
				debug.debug("REGISTRATION SUCCEEDED and user logged in.");
				req.session.authenticated = true;
				req.session.type = "stakeholder";
				
				req.flash("Registered new account!");
				res.redirect('/');
			})
			.error(function(){
				debug.debug("REGISTRATION FAILED!!!!");
				res.redirect('/register');
			});
		}
		else {
			res.render('auth/register', {
				title: 'Register | Sails Framework',
				validationErrors: {
					secret: (attempt && req.body.length > 0) ? 'That secret is invalid.' : undefined
				}
			});
		};
	}
	
});