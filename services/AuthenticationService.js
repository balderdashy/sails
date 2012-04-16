/**
 * Authentication middleware
 */
exports.policy = {
	
	////////////////////////////////////////////////
	////// ADD YOUR CUSTOM MIDDLEWARE HERE	////////
	////////////////////////////////////////////////
	//
	// Uses Express/Connect middleware semantics:
	// 
	
	//
	customMiddleware1: function (req,res,next) {
		
	},
	
	//
	customMiddleware2: function (req,res,next) {
		
	},
	
	// ...
	// 
	////////////////////////////////////////////////
	
	
	
	// Check nothing
	none: function (req,res,next) {
		next();
	},

	// Check whether the user is logged in AT ALL
	any: function (req,res,next) {
		// Remember where the user was trying to go so she can be redirected back
		req.session.reroutedFrom = req.url;
		console.log(req.session);

		if (req.session.authenticated) {
			next();
		}
		else {
			res.render('403',{title:'Access Denied'});
		}
	},


	// Check whether the user is *NOT* logged in AT ALL
	inverse: function (req,res,next) {
		if (!req.session.authenticated) {
			next();
		}
		else {
			// Access denied, but it would be weird to show a 403 page since the user is logged in
			// TODO: display a page explaining that these pages are inaccessible to authed users, and asking if the user would like to logout
			res.redirect('/');
		}
	},


	// Check whether the logged-in user is of a specific type
	only: function(roleName) {
		return function (req,res,next) {
			// Remember where the user was trying to go so she can be redirected back
			req.session.reroutedFrom = req.url;

			// Check if this Account has the specified role
			Account.hasRole(req.session.account,roleName,
			function() {
				next();
			}, function () {
				res.render('403',{title:'Access Denied'});
			});
		}
	}
}



/**
 * Session management helper
 */
exports.session = {
	
	// Merge the current session with the specified Account
	link: function (req,account) {
		req.session.authenticated = true;
		req.session.account = account.id;
	},
	
	// Disconnect the current session from all Accounts
	unlink: function (req) {
		req.session.authenticated = false;
		delete req.session.account;
	},
	
	// Handle routing back to original destination in session
	// if no original destination is stored, redirect to home page
	redirectToOriginalDestination: function (req,res,next) {
		if (req.session.reroutedFrom) {
			res.redirect(req.session.reroutedFrom);
			req.session.reroutedFrom = null;
		}
		else {
			res.redirect('/');
		}
	}
}