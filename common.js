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
