/**
 * 
 * Utility classes for use throughout application
 * 
 */

String.prototype.toCapitalized = function ()
{
	return this.charAt(0).toUpperCase() + this.slice(1);
}