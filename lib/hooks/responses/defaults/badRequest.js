/**
 * Module dependencies
 */

var util = require('util');
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

  // If no data was provided, use res.sendStatus().
  if (_.isUndefined(data)) {
    return res.sendStatus(400);
  }
  // If the data is an Error instance and it doesn't have a custom .toJSON(),
  // then util.inspect() it instead (otherwise res.json() will turn it into an empty dictionary).
  // Note that we don't use the `stack`, since `res.badRequest()` might be used in production,
  // and we wouldn't want to inadvertently dump a stack trace.
  if (_.isError(data)) {
    if (!_.isFunction(data.toJSON)) {
      // No need to JSON stringify (this is already a string).
      return res.send(util.inspect(data));
    }
  }
  return res.json(data);

};
