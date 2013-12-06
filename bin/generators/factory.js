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

	var fn,
		generatorPath = __dirname + '/' + generatorName;
	try {
		fn = require(generatorPath);
	}
	catch(e) {
		throw new Error(
			'Cannot require specified generator :: ' + 
			generatorPath + ' (' + generatorName + ')'
		);
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
			ok: _handlers.success || missingHandlerHandler('ok'),
			error: errorHandler || missingHandlerHandler('error'),
			invalid: missingHandlerHandler('invalid')
		});

		// Mix-in validator to options
		if (typeof options !== 'object') {
			return _handlers.error('Invalid options :: '+util.inspect(options));
		}
		options._require = function ( requiredOptions ) {
			return _.difference(requiredOptions, Object.keys(this));
		};

		fn(options, _handlers);
	};
};
