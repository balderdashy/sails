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
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)'
 * );
 * ```
 *
 * @param  {JSON?} data
 * @param  {Ref?} noLongerSupported
 *
 */

module.exports = function badRequest(data, noLongerSupported) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // If a second argument was given, log a message.
  if (noLongerSupported) {
    sails.log.debug('The second argument to `res.badRequest()` is deprecated.');
    sails.log.debug('To serve a view via `res.badRequest()`, override the response');
    sails.log.debug('in \'api/responses/badRequest.js\'.\n');
  }

  // Log error to console
  if (!_.isUndefined(data)) {
    sails.log.verbose('Sending 400 ("Bad Request") response: \n', data);
  }

  // Set status code
  res.status(400);

  // If no data was provided, use res.sendStatus().
  if (_.isUndefined(data)) {
    return res.sendStatus(400);
  }
  // If the data is an error instance and it doesn't have a custom .toJSON(),
  // use its stack instead (otherwise res.json() will turn it into an empty dictionary).
  if (_.isError(data)) {
    if (!_.isFunction(data.toJSON)) {
      data = data.stack;
    }
  }
  return res.json(data);

};
