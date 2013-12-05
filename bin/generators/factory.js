var _ = require('lodash');

module.exports = function ( generatorName, errorHandler ) {
	var fn = require('./' + generatorName);

	// Default error handler
	errorHandler = errorHandler || function defaultErrorHandler (err) {
		throw new Error(err || 'No error handler provided.');
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
