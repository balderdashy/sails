/**
 * Module dependencies
 */

// n/a



/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function forbidden () {

  // Get access to `res`
  var res = this.res;

  // Send status code and "Forbidden" message
  return res.sendStatus(403);

};
