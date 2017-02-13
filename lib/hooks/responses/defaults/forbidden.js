/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



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
 *
 * @param  {Ref?} noLongerSupported
 * @param  {Ref?} noLongerSupported2
 *
 */

module.exports = function forbidden (noLongerSupported, noLongerSupported2) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;


  // If a second argument was given, log a message.
  if (noLongerSupported||noLongerSupported2) {
    sails.log.debug('Passing arguments to `res.forbidden()` is now deprecated.');
    sails.log.debug('If you want to serve a view or handle the error object via `res.forbidden()`,');
    sails.log.debug(' override the response in \'api/responses/forbidden.js\'.\n');
  }

  // Send status code and "Forbidden" message
  return res.sendStatus(403);

};
