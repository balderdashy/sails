/**
 * Module dependencies
 */
var _ = require('lodash');

// http://nodejs.org/api/assert.html
var assert = require('assert');
var should = require('should');



/**
 * `expect`
 */
function expect () {}

/**
 * expect.exists()
 * 
 * Ensure that the specified variable exists (is not undefined)
 * in the test context. (i.e. `expect.exists("foo")` checks `this.foo`)
 *
 * @param {String} keyPath		[the key(s) to dereference]
 * 
 * @return {Function}		[bdd test]
 * @api public
 */
expect.exists = function (keypath) {
	return function () {
		should(_deepValue(this, keypath)).be.ok;
	};
};
expect.notExists = function (keypath) {
	return function () {
		should(_deepValue(this, keypath)).not.be.ok;
	};
};


/**
 * expect.equal()
 * 
 * Ensure that the specified variable in the test context is equal
 * to the specified compareToValue.
 * (i.e. `expect.equal("request.status")` checks `this.request.status`)
 *
 * @param {String} keyPath		[the key(s) to dereference]
 * @param {*} compareToValue	[the value to check]
 * 
 * @return {Function}		[bdd test]
 * @api public
 */
expect.equal = function (keypath, compareToValue ) {
	return function () {
		assert.equal( _deepValue(this, keypath), compareToValue );
	};
};





module.exports = expect;





// Private methods


/**
 * Dereference a "deep value" from an object, using a key like 'foo.bar.baz'
 * 
 * @param  {[type]} object	[the object to dereference]
 * @param  {String} path	[key, or 'key.subkey.subsubkey...']
 * 
 * @return {*}				[if the key(s) don't exist, return undefined, otherwise the value]
 *
 * @api private
 */
function _deepValue (object, path) {
	if ('undefined' === typeof object || object === null) {
		return undefined;
	}
	var val = object;
	path = path.split('.');
	while (path.length) {
		var part = path.shift();
		if ('undefined' == typeof val[part]) {
			return undefined;
		} else {
			val = val[part];
		}
	}
	return val;
}
