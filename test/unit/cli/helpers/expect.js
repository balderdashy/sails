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
		handlers = _.clone(expectations);
	}
	else throw new Error('Invalid usage of `expect()` fixture in tests.');

	return function (cb) {

		// Interpret handlers
		_.each( Object.keys(handlers), function (handlerName) {
			if ( handlers[handlerName] === true) {
				handlers[handlerName] = function ignoreHandlerArguments_itsAlwaysGood () { cb(); };
			}
			else {
				handlers[handlerName] = function incorrectHandlerFired (err) {
					var testMessage = 'Unexpected callback (' + handlerName + ') fired :: `' + expectations[handlerName] + '`';

					if ( err instanceof Error ) {
						err.message = testMessage + (err.message ? ' :: '+err.message : '');
					}
					else err = new Error( testMessage + (err ? ' :: '+err : '') );

					return cb(err);
				};
			}
		});
		
		// Trigger method
		this.fn(this.options, handlers);
	};
};

