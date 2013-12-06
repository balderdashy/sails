/**
 * Module dependencies
 */
var _ = require('lodash');

/**
 * @param {Object||String} expectations
 *		- if string specified, it is the name of the only valid handler
 *		- if object specified, keys are handlers
 *		- if value === true, this handler is allowed
 *		- otherwise, use the value as an error
 */
module.exports = function expect ( expectations ) {
	var handlers = {};
	if ( typeof expectations === 'string' ) {
		handlers[expectations] = true;
	}
	else if ( typeof expectations === 'object' ) {
		handlers = expectations;
	}
	else throw new Error('Invalid usage of `expect()` fixture in tests.');

	return function (cb) {

		// Interpret handlers
		_.each( Object.keys(handlers), function (handlerName) {
			if ( handlers[handlerName] === true) {
				handlers[handlerName] = function ignoreHandlerArguments_itsAlwaysGood () { cb(); };
			}
			else {
				handlers[handlerName] = function incorrectHandlerFired (msg) {
					if ( msg instanceof Error ) return msg;
					else return new Error(msg);
				};
			}
		});
		
		// Trigger method
		this.fn(this.options, handlers);
	};
};

