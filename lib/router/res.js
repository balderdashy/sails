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


  // Ensure res.headers and res.locals exist.
  // res = _.merge(res, {locals: {}, headers: {}}, _res);
  res = _.extend(res, {locals: {}, headers: {}});
  res = _.extend(res, _res);

  // Now that we're sure `res` is a Transform stream, we'll handle the two different
  // approaches which a user of the virtual request interpreter might have taken:

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // (1) Providing a callback function (`_clientCallback`)
  //
  // If a `_clientCallback` function was provided, also pipe `res` into a
  // fake clientRes stream where the response `body` will be buffered.
  if (res._clientCallback) {

    // If `res._clientRes` WAS NOT provided, then create one
    if (!res._clientRes) {
      res._clientRes = new MockClientResponse();
    }

    // Save session
    // if (_.isObject(req.session) && _.isFunction(req.session.save)) {
    //   req.session.save(function (err){
    //     if (err) {
    //       err = _.isObject(err) ? err : new Error(err);
    //       err.code = 'E_SESSION_SAVE';
    //       if (req._sails && req._sails.log){
    //         req._sails.log.error('Session could not be persisted. Details:', err);
    //       }
    //       else {
    //         console.error(err);
    //       }
    //     }
    //   });
    // }

    // The stream should trigger the callback when it finishes or errors.
    res._clientRes.on('finish', function() {
      return res._clientCallback(res._clientRes);
    });
    res._clientRes.on('error', function(err) {
      err = err || new Error('Error on response stream');
      res._clientRes.statusCode = 500;
      res._clientRes.body = err;
      return res._clientCallback(res._clientRes);
    });

  }
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // (2) Providing a Writable stream (`_clientRes`)
  //
  // If a `_clientRes` response Transform stream was provided, pipe `res` directly to it.
  if (res._clientRes) {
    res.pipe(res._clientRes);
  }
  //
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

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

    console.log('Calling res.send() :: Session is now: ',req.session);
    console.log('Calling res.send() :: res.headers are now: ',res.headers);

    // Ensure charset is set
    res.charset = res.charset || 'utf-8';

    // Ensure headers are set
    res.headers = res.headers || {};

    // Ensure statusCode is set
    // (override `this.statusCode` if `statusCode` argument specified)
    res.statusCode = args.statusCode || res.statusCode || 200;

    // if a `_clientCallback` was specified, we'll skip the streaming stuff for res.send().
    if (res._clientCallback) {

      // Manually plug in res.body.
      res.body = args.other;
      res._clientRes.body = res.body;
      // (but don't include body if it is empty)
      if (!res.body) delete res.body;
      if (!res._clientRes.body) delete res._clientRes.body;

      // Set status code and headers on the `_clientRes` stream so they are accessible
      // to the provider of that stream.
      // (this has to happen in `send()` because the code/headers might have just changed)
      if (res._clientRes) {

        // TODO: try `res.emit('header')` to trigger .on('header') listeners
        res._clientRes.headers = res.headers;
        res._clientRes.statusCode = res.statusCode;
      }

      // End the `res` stream (which will in turn end the `res._clientRes` stream)
      res.end();
      return;
    }

    // Otherwise, the hook using the interpreter must have provided us with a `res._clientRes` stream,
    // so we'll need to serialize everything to work w/ that stream.

    // Write body to `res` stream
    if (args.other) {

      var toWrite = args.other;

      if (typeof toWrite === 'object') {
        try {
          toWrite = JSON.stringify(args.other);

          // original method:
          // toWrite = util.inspect(toWrite);
        }
        catch(e) {
          var failedStringify = new Error(
            'Failed to stringify specified JSON response body :: ' + util.inspect(args.other) +
            '\nError:\n' + util.inspect(e)
          );
          console.log('failed to stringify!');
          if (req._sails && req._sails.log && req._sails.log.error) {
            req._sails.log.error(failedToStringify);
          }
          else {
            console.error(failedToStringify);
          }
          toWrite = failedStringify.message;
          res.statusCode = 500;
        }
      }
      res.write(toWrite);
    }

    // Set status code and headers on the `_clientRes` stream so they are accessible
    // to the provider of that stream.
    // (this has to happen in `send()` because the code/headers might have just changed)
    if (res._clientRes) {
      res._clientRes.headers = res.headers;
      res._clientRes.statusCode = res.statusCode;
    }

    // End the `res` stream.
    res.end();
  };

  // res.json()
  res.json = res.json || function json_shim () {
    var args = normalizeResArgs(arguments);
    return res.send(args.other, args.statusCode || res.statusCode || 200);
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


  /**
   * res.set( headerName, value )
   *
   * @param {[type]} headerName [description]
   * @param {[type]} value   [description]
   */
  res.set = function (headerName, value) {
    res.headers = res.headers || {};
    res.headers[headerName] = value;
    return value;
  };

  /**
   * res.get( headerName )
   *
   * @param  {[type]} headerName [description]
   * @return {[type]}            [description]
   */
  res.get = function (headerName) {
    return res.headers && res.headers[headerName];
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


// The constructor for clientRes stream
// (just a normal transform stream)
function MockClientResponse() {
  Transform.call(this);
}
util.inherits(MockClientResponse, Transform);
MockClientResponse.prototype._transform = function(chunk, encoding, next) {
  this.push(chunk);
  next();
};
