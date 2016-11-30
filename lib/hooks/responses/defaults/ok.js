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
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function sendOK (data) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // If a second argument was given, log a message.
  if (arguments[1]) {
    sails.log.debug('The second argument to `res.ok()` is deprecated.');
    sails.log.debug('To serve a view via `res.ok()`, override the response');
    sails.log.debug('in \'api/responses/ok.js\'.\n');
  }

  // Set status code
  res.status(200);

  // If the data is an error instance and it doesn't have a custom .toJSON(),
  // use its stack instead (otherwise res.json() will turn it into an empty dictionary).
  if (_.isError(data)) {
    if (!_.isFunction(data.toJSON)) {
      data = data.stack;
    }
  }

  return res.json(data);

};
