_.extend(exports,{
	
	// Login to an Account
	login: function () {
		console.log(this);
		var secretAttempt = this.req.body && this.req.body.secret;

		if (secretAttempt) {
			
			Account.find({
				where: {
					password: secretAttempt
				}
			}).success(function (account) {
				
				if (account) {
					// Store authenticated state in session
					AuthenticationService.session.link(this.req,account);
					AuthenticationService.session.redirectToOriginalDestination(this.req,this.res,this.next);
				}
				else {
					// Unknown user
					this.res.render('auth/login', {
						title: 'Login | Sails Framework',
						loginError: (secretAttempt && secretAttempt.length>0) ? 'That password is incorrect.' : undefined
					});
				}
			}).error(function() {
				debug.error("An error occured while logging in!");
			});
		}
		else {
			this.res.render('auth/login', {
				title: 'Login | Sails Framework',
				loginError: (secretAttempt && secretAttempt.length>0) ? 'Please specify a password.' : undefined
			});
		}
	},
	
	
	// Logout of an Account
	logout: function () {
		this.req.session.reroutedFrom = null;
		AuthenticationService.session.unlink(this.req);
		this.res.redirect('/login');
	},
	
	
	
	// Register for an Account
	register: function () {
		var attempt = this.req.body && this.req.body.submitted;
	
		// Register and log in as a particular role
		var registerAs = "user";
	
		// Register new account object
		if (attempt) {
			
			var account = Account.create ({
				username:this.req.body.username,
				password:this.req.body.password
			}).success(function(){
				debug.debug("REGISTRATION SUCCEEDED and user logged in.");
				
				AuthenticationService.session.link(this.req,account);
				this.req.flash("Your account was registered successfully!");
				this.res.redirect('/');
			})
			.error(function() {
				debug.debug("REGISTRATION FAILED!!!!");
				
				this.req.flash("An error occured while processing your registration.");
				this.res.redirect('/register');
			});
		}
		else {
			this.render('auth/register', {
				title: 'Register | Sails Framework',
				validationErrors: {
					secret: (attempt && this.req.body.password.length > 0) ? 'Validation errors.' : undefined
				}
			});
		};
	}
	
});