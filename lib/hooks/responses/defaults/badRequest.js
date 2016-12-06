/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 * return res.badRequest(data, 'some/specific/badRequest/view');
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */

module.exports = function badRequest(data) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // Log error to console
  if (!_.isUndefined(data)) {
    sails.log.verbose('Sending 400 ("Bad Request") response: \n', data);
  }

  // Set status code
  res.status(400);

  // If appropriate, serve data as JSON.
  if (req.wantsJSON) {
    // If the data is an error instance and it doesn't have a custom .toJSON(),
    // use its stack instead (otherwise res.json() will turn it into an empty dictionary).
    if (_.isError(data)) {
      if (!_.isFunction(data.toJSON)) {
        data = data.stack;
      }
    }
    return res.json(data);
  }

  return res.view('400', { data: data }, function (err, html) {

    // If a view error occured, fall back to JSON.
    if (err) {
      //
      // Additionally:
      // • If the view was missing, ignore the error but provide a verbose log.
      if (err.code === 'E_VIEW_FAILED') {
        sails.log.verbose('res.badRequest() :: Could not locate view for error page (sending JSON instead).  Details: ', err);
      }
      // Otherwise, if this was a more serious error, log to the console with the details.
      else {
        sails.log.warn('res.badRequest() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
      }
      return res.json(data);
    }

    return res.send(html);
  });

};
