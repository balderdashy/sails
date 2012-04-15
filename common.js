/**
 * 
 * Utility logic for use throughout application
 * 
 */








// Add capitalization method to String class
String.prototype.toCapitalized = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}


