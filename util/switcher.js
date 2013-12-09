/**
 * Module dependencies
 */
var _ = require('lodash');
var util = require('util');




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
		if (err) {
			return Handler.error.apply(callbackContext || this, args);
		}
		return Handler.ok.apply(callbackContext || this, args.slice(1));
	};



	// If callback is provided as a function, transform it into an object
	// w/ multiple copies of the callback.
	if ( _.isFunction(callback) ) {
		var _originalCallbackFn = callback;
		callback = {
			ok: function () {
				// shift arguments over to make sure the first arg won't be perceived as an `err`
				var args = Array.prototype.slice.call(arguments);
				args.unshift(null);
				_originalCallbackFn.apply(callbackContext || this, args);
			},
			error: function () {
				// ensure a first arg exists (err)-- default to simple `unexpected error`
				var args = Array.prototype.slice.call(arguments);
				if (!args[0]) {
					args[0] = new Error();
				}
				_originalCallbackFn.apply(callbackContext || this, args);
			}
		};
	}
	callback = callback || {};



	// Mix-in custom handlers from callback.
	_.extend(Handler, callback );



	// Supply a handful of default handlers to provide better error messages.
	var unknownCaseHandler = function ( caseName, err ) {
		return function unknownCase ( /* ... */ ) {
			var args = Array.prototype.slice.call(arguments);
			err = (args[0] ? util.inspect(args[0])+'        ' : '') + (err ? '('+(err||'')+')' : '');

			if ( _.isFunction(defaultErrorHandler) ) {
				return defaultErrorHandler(err);
			}
			else throw new Error(err);
		};
	};
	_.defaults(Handler, {
		error: unknownCaseHandler('error', '`error` case triggered, but no handler was implemented.'),
		ok: unknownCaseHandler('ok', '`ok` case triggered, but no handler was implemented.'),
		invalid: unknownCaseHandler('invalid', '`invalid` case triggered, but no handler was implemented.')
	});

	return Handler;
};
