/**
 * Module dependencies
 */
var _ = require('lodash');
var util = require('util');




/**
 * @param {String} generatorName
 * @param {Function} errorHandler
 *			- Default error handler to use for this generator
 */
module.exports = function ( generatorName, errorHandler ) {

	var fn;

	// Try `generators`
	try {
		fn = require( __dirname + '/' + generatorName );
	}
	catch(e0) {

		// // Try npm
		// try {
		// 	fn = require( __dirname + '/_helpers/' + generatorName );
		// }
		// catch (e1) {
			throw new Error(
				'Cannot require specified generator ' + 
				' (' + generatorName + ')'
			);
		// }
	}

	// Default missing handler handler
	var missingHandlerHandler = function (handlerName) {
		var msg = '`' + handlerName + '` triggered, but no handler was provided.';
		return function (err) {
			if (err) { msg += '\n' + util.inspect(err); }
			throw new Error(msg);
		};
	};


	// Return closure which augments options + handlers
	return function (options, handlers) {

		var _handlers = _.cloneDeep(handlers);

		// Ensure `ok`, `error`, and `invalid` always exist
		// Defaults for when the following handlers are missing:
		_.defaults(_handlers, {
			ok: _handlers.ok || missingHandlerHandler('ok'),
			error: errorHandler || missingHandlerHandler('error'),
			invalid: missingHandlerHandler('invalid')
		});

		// Mix-in validator to options
		if (typeof options !== 'object') {
			return _handlers.error('Invalid options :: '+util.inspect(options));
		}


		fn(options, _handlers);
	};
};
