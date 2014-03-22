/**
 * Generic Error Handler / Classifier
 *
 * Calls the appropriate custom response for a given error,
 * out of the bundled response modules: 
 * badRequest, forbidden, notFound, & serverError
 * 
 * Defaults to `res.serverError`
 * 
 * Usage:
 * ```javascript
 * if (err) return res.negotiate(err);
 * ```
 *
 * @param {*} error(s)
 *
 */

module.exports = function (err) {

	// Get access to response object (`res`)
	var res = this.res;

	if (!err) return res.serverError(new Error('Invalid usage of `res.negotiate(err)`: `err` must be defined'));
	if (typeof err.status !== 'number') return res.serverError(new Error('Invalid usage of `res.negotiate(err)`: `err.status` must be a number.'));
	
	if (err.status === 403) return res.forbidden(err);
	if (err.status === 404) return res.notFound(err);
	if (err.status >= 400 && err.status < 500) return res.badRequest(err);
	return res.serverError(err);
};
