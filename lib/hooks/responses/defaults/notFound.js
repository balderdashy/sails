/**
 * Module dependencies
 */

// n/a



/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(err);
 * return res.notFound(err, 'some/specific/notfound/view');
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 */

module.exports = function notFound () {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // Set status code
  res.status(404);

  // If the request wants JSON, send back the appropriate status code.
  if (req.wantsJSON || !res.view) {
    return res.sendStatus(404);
  }

  return res.view('404', {}, function (err, html) {
    // If a view error occured, fall back to JSON.
    if (err) {
      //
      // Additionally:
      // • If the view was missing, ignore the error but provide a verbose log.
      if (err.code === 'E_VIEW_FAILED') {
        sails.log.verbose('res.notFound() :: Could not locate view for error page (sending text instead).  Details: ', err);
      }
      // Otherwise, if this was a more serious error, log to the console with the details.
      else {
        sails.log.warn('res.notFound() :: When attempting to render error page view, an error occured (sending text instead).  Details: ', err);
      }
      return res.sendStatus(404);
    }

    return res.send(html);
  });

};
