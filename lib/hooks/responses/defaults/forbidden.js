/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



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

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // Set status code
  res.status(403);

  // If appropriate, serve data as JSON.
  if (req.wantsJSON) {
    return res.send();
  }

  return res.view('403', function (err, html) {

    // If a view error occured, fall back to JSON.
    if (err) {
      //
      // Additionally:
      // • If the view was missing, ignore the error but provide a verbose log.
      if (err.code === 'E_VIEW_FAILED') {
        sails.log.verbose('res.forbidden() :: Could not locate view for error page (sending text instead).  Details: ', err);
      }
      // Otherwise, if this was a more serious error, log to the console with the details.
      else {
        sails.log.warn('res.forbidden() :: When attempting to render error page view, an error occured (sending text instead).  Details: ', err);
      }
      return res.send('FORBIDDEN');
    }

    return res.send(html);
  });

};
