/**
 * Module dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var path = require('path');
var _ = require('lodash');
var MockRes = require('mock-res');
var fsx = require('fs-extra');


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

  // If `_res` appears to be a stream (duck-typing), then don't try
  // and turn it into a mock stream again.
  if (typeof _res === 'object' && _res.end) {
    res = _res;
  }
  else {
    res = new MockRes();
  }


  // // Now that we're sure `res` is a Transform stream, we'll handle the two different
  // // approaches which a user of the virtual request interpreter might have taken:

  // // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // // (1) Providing a Writable stream (`_clientRes`)
  // //
  // // If a `_clientRes` response Transform stream was provided, pipe `res` directly to it.
  // if (res._clientRes) {
  //   res.pipe(res._clientRes);
  // }
  // //
  // // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *


  // // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // // (2) Providing a callback function (`_clientCallback`)
  // //
  // // If a `_clientCallback` function was provided, also pipe `res` into a
  // // fake clientRes stream where the response `body` will be buffered.
  // if (_res._clientCallback) {

  //   // res.pipe(clientRes);
  //   // TODO:
  // }
  // // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *


  // Ensure res.headers and res.locals exist.
  res = _.merge(res, {locals: {}, headers: {}}, _res);

  // res.status()
  res.status = res.status || function status_shim (statusCode) {
    res.statusCode = statusCode;
  };

  // res.send()
  res.send = res.send || function send_shim () {
    var args = normalizeResArgs(arguments);

    // Don't allow users to respond/redirect more than once per request
    try {
      onlyAllowOneResponse(res);
    }
    catch (e) {
      if (req._sails && req._sails.log && req._sails.log.error) {
        req._sails.log.error(e);
        return;
      }
      console.error(e);
      return;
    }

    // Ensure charset is set
    res.charset = res.charset || 'utf-8';

    // Ensure statusCode is set
    // (override `this.statusCode` if `statusCode` argument specified)
    res.statusCode = args.statusCode || res.statusCode || 200;


    // Now that we're sure `res` is a Transform stream, we'll handle the two different
    // approaches which a user of the virtual request interpreter might have taken:

    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // (1) Providing a Writable stream (`_clientRes`)
    //
    // If a `_clientRes` response Transform stream was provided, pipe `res` directly to it.
    if (res._clientRes) {

      // Set status code and headers on the `_clientRes` stream so they are accessible
      // to the provider of that stream.
      res._clientRes.headers = res.headers;
      res._clientRes.statusCode = res.statusCode;

      res.pipe(res._clientRes);
    }
    //
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *


    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    // (2) Providing a callback function (`_clientCallback`)
    //
    // If a `_clientCallback` function was provided, also pipe `res` into a
    // fake clientRes stream where the response `body` will be buffered.
    if (res._clientCallback) {

      // res.pipe(clientRes);
      // TODO:
    }
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

    // Write body to `res` stream if it exists
    if (args.other) {
      var toWrite = args.other;
      if (typeof toWrite === 'object') {
        toWrite = util.inspect(toWrite);
      }
      res.write(toWrite);
    }

    // End the `res` stream.
    res.end();
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

    if (!req._sails) {
      return  res.send('Cannot call res.render() - `req._sails` was not attached', 500);
    }
    if (!req._sails.renderView) {
      return res.send('Cannot call res.render() - `req._sails.renderView` was not attached (perhaps `views` hook is not enabled?)', 500);
    }

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


/**
 * NOTE: ALL RESPONSES (INCLUDING REDIRECTS) ARE PREVENTED ONCE THE RESPONSE HAS BEEN SENT!!
 * Even though this is not strictly required with sockets, since res.redirect()
 * is an HTTP-oriented method from Express, it's important to maintain consistency.
 *
 * @api private
 */
function onlyAllowOneResponse (res) {
  if (res._virtualResponseStarted) {
    throw new Error('Cannot write to response more than once');
  }
  res._virtualResponseStarted = true;
}

