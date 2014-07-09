/**
 * Module dependencies
 */
var util = require('util');
var _ = require('lodash');
var MockRes = require('mock-res');
var fsx = require('fs-extra');
var path = require('path');


/**
 * Ensure that response object has a minimum set of reasonable defaults
 * Used primarily as a test fixture.
 *
 * @api private
 * @idempotent
 */

module.exports = function buildResponse (req, _res) {
  _res = _res||{};
  req = req||{};

  var res;

  if (typeof _res === 'object' && _res.end) {
    res = _res;
  }
  else {
    res = new MockRes();
  }
  res = _.merge(res, {locals: {}, headers: {}}, _res);


  // res.status()
  res.status = res.status || function status_shim (statusCode) {
    res.statusCode = statusCode;
  };


  // res.send()
  res.send = res.send || function send_shim () {
    var args = normalizeResArgs(arguments);

    if (!res.end || !res.write) {
      return res._cb();
    }
    else {
      res.statusCode = args.statusCode || res.statusCode || 200;

      if (args.other) {
        var toWrite = args.other;
        if (typeof toWrite === 'object') {
          toWrite = util.inspect(toWrite);
        }
        res.write(toWrite);
      }
      res.end();
    }
  };

  // res.json()
  res.json = res.json || function json_shim () {
    var args = normalizeResArgs(arguments);

    try {
      var json = JSON.stringify(args.other);
      return res.send(json, args.statusCode || res.statusCode || 200);
    }
    catch(e) {
      var failedStringify = new Error(
        'Failed to stringify specified JSON response body :: ' + util.inspect(args.other) +
        '\nError:\n' + util.inspect(e)
      );
      return res.send(failedStringify.stack, 500);
    }
  };

  // res.render()
  res.render = res.render || function render_shim (relativeViewPath, locals, cb) {
    if (_.isFunction(arguments[1])) {
      cb = arguments[1];
      locals = {};
    }
    if (!req._sails.renderView) return res.send('Cannot call res.render() - `views` hook is not enabled', 500);

    // TODO:
    // Instead of this shim, turn `sails.renderView` into something like
    // `sails.hooks.views.render()`, and then call it.
    return res.send(501,'Not implemented in core yet');
  };


  return res;


};


/**
 * As long as one of them is a number (i.e. a status code),
 * allows a 2-nary method to be called with flip-flopped arguments:
 *    method( [statusCode|other], [statusCode|other] )
 *
 * This avoids confusing errors & provides Express 2.x backwards compat.
 *
 * E.g. usage in res.send():
 *    var args    = normalizeResArgs.apply(this, arguments),
 *      body    = args.other,
 *      statusCode  = args.statusCode;
 *
 * @api private
 */
function normalizeResArgs( args ) {

  // Traditional usage:
  // `method( other [,statusCode] )`
  var isNumeric = function (x) {
    return (+x === x);
  };
  if (isNumeric(args[0])) {
    return {
      statusCode: args[0],
      other: args[1]
    };
  }
  else return {
    statusCode: args[1],
    other: args[0]
  };
}
