/**
 * Module dependencies
 */
var _ = require('lodash');
var util = require('util');



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

	// Default error handler
	errorHandler = errorHandler || function defaultErrorHandler (err) {
		throw new Error('No error handler provided.\n' + util.inspect(err));
	};

	// Return closure which augments options + handlers
	return function (options, handlers) {

		var _handlers = _.cloneDeep(handlers);

		// Ensure `ok`, `error`, and `invalid` always exist
		// Defaults for when the following handlers are missing:
		_.defaults(_handlers, {
			ok: _handlers.success,
			error: errorHandler,
			invalid: _handlers.error || errorHandler
		});


		// Mix-in validator to options
		if (typeof options !== 'object') {
			return handlers.error('Invalid options.');
		}
		options._require = function ( requiredOptions ) {
			return _.difference(requiredOptions, Object.keys(this));
		};

		fn(options, _handlers);
	};
};
