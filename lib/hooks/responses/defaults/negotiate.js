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

  // Make sure `err` exists in a deterministic format
  if (typeof err === 'object') return res.json(err);
  else if (err) err = { status: 500, message: err };
  else if (!err) err = { status: 500 };

  // Set the status (should be taken care of by res.* methods, but just in case)
  res.status(err.status || 500);

  // Respond using the appropriate custom response
	if (err.status === 403) return res.forbidden(err);
	if (err.status === 404) return res.notFound(err);
	if (err.status >= 400 && err.status < 500) return res.badRequest(err);
	return res.serverError(err);
};
