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

  var statusCode = 500;
  var body = err;

  try {

    statusCode = err.status || 500;

  //   // `err` is a usable `Error`
  //   if (typeof err === 'object' && err instanceof Error && !err.toJSON && err.toString) {
  //     statusCode = err.status || statusCode;
  //     body = { status: statusCode, message: err.toString()};
  //   }
  //   // `err` is an object w/ a toJSON() method
  //   else if (typeof err === 'object' ) {
  //     statusCode = err.status || statusCode;
  //     body = err;
  //   }
  //   // `err` is NOT an object
  //   else if (err) {
  //     body = { status: statusCode, message: err };
  //   }
  //   // `err` is not defined at all (falsy)
  //   else if (!err) {
  //     body = { status: statusCode, message: 'Unexpected server error.' };
  //   }

    // Set the status
    // (should be taken care of by res.* methods, but this sets a default just in case)
    res.status(statusCode);

  } catch (e) {}

  // Respond using the appropriate custom response
  if (statusCode === 403) return res.forbidden(body);
  if (statusCode === 404) return res.notFound(body);
  if (statusCode >= 400 && statusCode < 500) return res.badRequest(body);
  return res.serverError(body);
};
