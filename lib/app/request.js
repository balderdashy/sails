/**
 * Module dependencies.
 */

var async         = require('async');
var _             = require('lodash');


/**
 * Originate a new request instance and lob it at this Sails
 * app at the specified route `address`.
 *
 * Particularly useful for running unit/integration tests without
 * actually having to bind the HTTP and/or WebSocket servers to
 * a TCP port.
 *
 * @param  {String} address
 * @param  {Function} cb
 * @return {JSDeferred}
 *
 * @api public
 */

module.exports = function request (address, cb) {

  var sails = this;

  // TODO: implement
  cb();

  // TODO: return JSDeferred instance
};
