/**
 * Module dependencies
 */

// n/a



/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 *
 * e.g.:
 * ```
 * return res.forbidden();
 * ```
 */

module.exports = function forbidden () {

  // Get access to `res`
  var res = this.res;

  // Send status code and "Forbidden" message
  return res.sendStatus(403);

};
