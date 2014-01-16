/**
 * Module dependencies
 */
var util = require('util');


/**
 * Look up a string by name, using environment variable
 * to detect the appropriate locale.
 * If a stringfile doesn't exist, default to `en`.
 *
 * @api experimental
 *
 * @address {String} keypath    [e.g. 'cli.new.successful']
 * @address {Object} args       [ordered scope args for `util.format()`]
 * @return {String}
 */
module.exports = function getString (keypath, args) {

	var locale =
	process.env.LANGUAGE    ||
	process.env.LC_ALL      ||
	process.env.LC_MESSAGES ||
	process.env.LANG        ||
	'en';
	locale = locale.toLowerCase();

	// Just to be safe, check that there are no '/'
	// (in case an attacker attempts to use environment
	// variables to load malicious code)
	if (locale.match(/[^\/]+/)) return util.format('INVALID LOCALE: %s',locale);

	var stringfile;
	try {
		stringfile = require('./'+locale);
	}
	catch(e) {
		return util.format(
		'ERROR LOADING LOCALE: '+
		'Unable to find stringfile for locale `%s`',
		locale);
	}

	var strtemplate = _deepValue(stringfile, keypath);
	if (!strtemplate) return util.format('STRING `%s` NOT DEFINED IN `%s` LOCALE!',keypath, locale);

	return util.format.apply( null, [strtemplate].concat(args || []));
};



/**
 * @api private
 *
 * Lookup a value in an object given a keypath.
 * 
 * @param  {Object} object [description]
 * @param  {String} path   [description]
 * @return {[type]}        [description]
 */
function _deepValue (object, path) {
	if ('undefined' == typeof object || object === null) {
		return null;
	}
	var val = object;
	path = path.split('.');
	while (path.length) {
		var part = path.shift();
		if ('undefined' == typeof val[part]) {
			return null;
		} else {
			val = val[part];
		}
	}
	return val;
}