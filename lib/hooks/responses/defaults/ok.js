/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 *
 * @param  {JSON?} data
 * @param  {Ref?} noLongerSupported
 */

module.exports = function sendOK (data, noLongerSupported) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // If a second argument was given, log a message.
  if (noLongerSupported) {
    sails.log.debug('The second argument to `res.ok()` is deprecated.');
    sails.log.debug('To serve a view via `res.ok()`, override the response');
    sails.log.debug('in \'api/responses/ok.js\'.\n');
  }

  // Determine the status code to set.
  var statusCodeToSet = 200;

  // Set status code
  res.status(statusCodeToSet);

  // If no data was provided, use res.sendStatus().
  if (_.isUndefined(data)) {
    return res.sendStatus(statusCodeToSet);
  }

  // If the data is an error instance and it doesn't have a custom .toJSON(),
  // use its stack instead (otherwise res.json() will turn it into an empty dictionary).
  if (_.isError(data)) {
    if (!_.isFunction(data.toJSON)) {
      data = data.stack;
      // No need to stringify the stack (it's already a string).
      return res.send(stack);
    }
  }

  return res.json(data);

};
