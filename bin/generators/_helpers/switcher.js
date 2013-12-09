var _ = require('lodash'),
	util = require('util');


/**
 * `switcher`
 *
 * Switching utility which builds and returns a handler which is capable
 * calling one of several callbacks.
 *
 * @param {Object|Function} callback
 *			- a handler object or a standard 1|2-ary node callback.
 * @param {Object} [defaultErrorHandler]
 *			- callback for when none of the other handlers match
 * @param {Object} [callbackContext]
 *			- optional `this` context for callbacks
 */

module.exports = function switcher( callback, defaultErrorHandler, callbackContext ) {

	// Default handler + statuses-- can be called as a function.
	var Handler = function( /* err, arg1, arg2, ..., argN */ ) {
		var args = Array.prototype.slice.call(arguments);
		var err = args[0];
		if (err) return Handler.error.apply(callbackContext || this, args);
		return Handler.ok.apply(callbackContext || this, args);
	};



	// If callback is provided as a function, transform it into an object
	// w/ multiple copies of the callback.
	if ( _.isFunction(callback) ) {
		var _originalCallbackFn = callback;
		callback = {
			ok: _originalCallbackFn,
			error: _originalCallbackFn
		};
	}
	callback = callback || {};



	// Mix-in custom handlers from callback.
	_.extend(Handler, callback || {});



	// Supply a handful of default handlers to provide better error messages.
	var unknownCaseHandler = function ( caseName ) {
		return function unknownCase ( /* ... */ ) {
			var args = Array.prototype.slice.call(arguments);

			var err = new Error(
			'`' + caseName + '` case triggered, but no handler was implemented.\n'+
			'\tOutput :: '+util.inspect(args)+'\n'
			);
			console.log(defaultErrorHandler);
			if ( _.isFunction(defaultErrorHandler) ) {
				return defaultErrorHandler(err);
			}
			else throw err;
		};
	};
	_.defaults(Handler, {
		error: unknownCaseHandler('error'),
		ok: unknownCaseHandler('ok'),
		invalid: Handler.error || unknownCaseHandler('invalid')
	});

	return Handler;
};
