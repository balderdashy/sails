/**
 * Module dependencies
 */
var util = require('util');
var Transform = require('stream').Transform;
var _ = require('@sailshq/lodash');
var MockRes = require('mock-res');


/**
 * Ensure that response object has a minimum set of reasonable defaults
 * Used primarily as a test fixture.
 *
 * @api private
 * @idempotent
 */

module.exports = function _buildResponse (req, _res) {
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
    delete res.statusCode;
  }


  // Ensure res.headers and res.locals exist.
  res = _.extend(res, {locals: {}, headers: {}, _headers: {}});
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

    // Session is saved automatically since the virtual request interpreter is
    // using `express-session` directly as of https://github.com/balderdashy/sails/commit/58e93f5a5f2e667e3fbeddf5b4b356f813e3555e.

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


  // Track whether headers have been written
  // (TODO: pull all this into mock-res via a PR)

  // res.writeHead() is wrapped in closure by the `on-header` module,
  // but it still needs the underlying impl
  res.writeHead = function ( /* statusCode, [reasonPhrase], headers */) {
    // console.log('\n\n• res.writeHead(%s)', Array.prototype.slice.call(arguments));
    var statusCode = +arguments[0];
    //TODO: Analyze this code, reasonPhras not used
    var reasonPhrase = (function(){
      if (arguments[2] && _.isString(arguments[1])) {
        return arguments[1];
      }
      return undefined;
    })();
    var newHeaders = (function (){
      if (arguments[2] && _.isObject(arguments[2])) {
        return arguments[2];
      }
      return arguments[1];
    })();

    if (!statusCode) {
      throw new Error('`statusCode` must be passed to res.writeHead().');
    }
    // Set status code
    res.statusCode = statusCode;

    // Ensure `._headers` have been merged into `.headers`
    _.extend(res.headers, res._headers);

    if (newHeaders) {
      if (!_.isObject(newHeaders)) {
        throw new Error('`headers` must be passed to res.writeHead() as an object. Got: '+util.inspect(newHeaders, false, null));
      }
      // Set new headers
      _.extend(res.headers, newHeaders);
    }

    // Set status code and headers on the `_clientRes` stream so they are accessible
    // to the provider of that stream.
    // (this has to happen in `send()` because the code/headers might have just changed)
    if (res._clientRes) {
      // console.log('Setting headers on clientRes- res.headers = ',res.headers);
      res._clientRes.headers = res.headers;
      res._clientRes.statusCode = res.statusCode;
    }

  };


  // Wrap res.write() and res.end() to get them to call writeHead()
  var prevWrite = res.write;
  res.write = function (){
    res.writeHead(res.statusCode, _.extend(res._headers,res.headers));
    // console.log('res.write():: called writeHead with headers=',_.extend(res._headers,res.headers));
    prevWrite.apply(res, Array.prototype.slice.call(arguments));
  };
  var prevEnd = res.end;
  res.end = function (){
    res.writeHead(res.statusCode, _.extend(res._headers,res.headers));
    // console.log('our res.end() was triggered');
    // console.log('res.end():: called writeHead with headers=',_.extend(res._headers,res.headers));
    prevEnd.apply(res, Array.prototype.slice.call(arguments));
  };


  // we get `setHeader` from mock-res
  // see http://nodejs.org/api/http.html#http_response_setheader_name_value
  //
  // Usage:
  // response.setHeader("Set-Cookie", ["type=ninja", "language=javascript"]);

  // If we ever need to wrap it...
  //
  // var prevSetHeader = res.setHeader;
  // res.setHeader = function (){
  //   prevSetHeader.apply(res, Array.prototype.slice.call(arguments));
  // };

  // res.status()
  res.status = res.status || function status_shim (statusCode) {
    res.statusCode = statusCode;
    return res;
  };

  // res.send()
  res.send = res.send || function send_shim () {
    var args = normalizeResArgs(arguments);

    // Don't allow users to respond/redirect more than once per request
    // TODO: prbly move this check to our `res.writeHead()` impl
    try {
      onlyAllowOneResponse(res);
    }
    catch (e) {
      if (req._sails && req._sails.log && req._sails.log.error) {
        req._sails.log.error(e);
        return;
      }
      // TODO: use debug()
      console.error(e);
      return;
    }

    // Ensure charset is set
    res.charset = res.charset || 'utf-8';

    // Ensure headers are set
    _.extend(res.headers, res._headers);

    // Ensure statusCode is set
    // (override `this.statusCode` if `statusCode` argument specified)
    res.statusCode = args.statusCode || res.statusCode || 200;

    // if a `_clientCallback` was specified, we'll skip the streaming stuff for res.send().
    if (res._clientCallback) {

      // Hard-code `res.body` rather than writing to the stream.
      // (but don't include body if it is empty)
      if (args.other) {
        res.body = args.other;
        // Then expose on res._clientRes.body
        res._clientRes.body = res.body;
      }

      // End the `res` stream (which will in turn end the `res._clientRes` stream)
      res.end();
      return;
    }

    //
    // Otherwise, the hook using the interpreter must have provided us with a `res._clientRes` stream,
    // so we'll need to serialize everything to work w/ that stream.
    //

    // console.log('\n---\nwriting to clientRes stream...');
    // console.log('res.headers =>',res.headers);
    // console.log('res._headers =>',res._headers);

    // Write body to `res` stream
    if (args.other) {

      var toWrite = args.other;

      if (typeof toWrite === 'object') {
        try {
          toWrite = JSON.stringify(args.other);

          // original way:
          // toWrite = util.inspect(toWrite);
        }
        catch(e) {
          var failedStringify = new Error(
            'Failed to stringify specified JSON response body :: ' + util.inspect(args.other) +
            '\nError:\n' + util.inspect(e)
          );
          // console.log('failed to stringify!');
          if (req._sails && req._sails.log && req._sails.log.error) {
            req._sails.log.error(failedStringify);
          }
          else {
            // todo: use debug()
            console.error(failedStringify);
          }
          toWrite = failedStringify.message;
          res.statusCode = 500;
        }
      }
      res.write(toWrite);
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
      return  res.send(500, 'Cannot call res.render() - `req._sails` was not attached');
    }
    if (!req._sails.renderView) {
      return res.send(500, 'Cannot call res.render() - `req._sails.renderView` was not attached (perhaps `views` hook is not enabled?)');
    }

    // TODO:
    // Instead of this shim, turn `sails.renderView` into something like
    // `sails.hooks.views.render()`, and then call it.
    return res.send(501,'Not implemented in core yet');
  };

  // res.redirect()
  res.redirect = res.redirect || function redirect_shim () {
    var args = normalizeResArgs(arguments);

    var address = args.other;

    // Set location header
    res.set('Location',address);

    // address = this.get('Location');
    return res.send(args.statusCode || res.statusCode || 302, 'Redirecting to '+encodeURI(address));
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
    return this;
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
