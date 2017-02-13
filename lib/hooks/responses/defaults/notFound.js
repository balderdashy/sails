/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
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
 *
 * @param  {Ref?} noLongerSupported
 * @param  {Ref?} noLongerSupported2
 *
 */

module.exports = function notFound (noLongerSupported, noLongerSupported2) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;


  // If a second argument was given, log a message.
  if (noLongerSupported||noLongerSupported2) {
    sails.log.debug('Passing arguments to `res.notFound()` is now deprecated.');
    sails.log.debug('If you want to serve a view or handle the error object via `res.notFound()`,');
    sails.log.debug(' override the response in \'api/responses/notFound.js\'.\n');
  }

  // Set status code
  res.status(404);

  // If the request wants JSON, send back the appropriate status code.
  if (req.wantsJSON) {
    return res.sendStatus(404);
  }

  return res.view('404', function (err, html) {

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
