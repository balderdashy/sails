/**
 * 
 * Utility logic for use throughout application
 * 
 */



// Sequelize query chainer 
QueryChainer = Sequelize.Utils.QueryChainer;




// Add capitalization method to String class
String.prototype.toCapitalized = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}




// Handle routing back to original destination in session
// if no original destination is stored, redirect to home page
global.redirectToOriginalDestination = function (req,res,next) {
	if (req.session.reroutedFrom) {
		res.redirect(req.session.reroutedFrom);
		req.session.reroutedFrom = null;
	}
	else {
		res.redirect('/');
	}
}
