/**
 * Module dependencies
 */

var util = require('util');
var http = require('http');
var Transform = require('stream').Transform;
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var MockRes = require('./mock-res');// «FUTURE: consolidate that into this file


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

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Actually use the "reasonPhrase", if one was provided.
    // ```
    // var reasonPhrase = (function(){
    //   if (arguments[2] && _.isString(arguments[1])) {
    //     return arguments[1];
    //   }
    //   return undefined;
    // })();
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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
  res.status = res.status || function _statusShim (statusCode) {
    res.statusCode = statusCode;
    return res;
  };

  // res.sendStatus()
  // (send a text representation of a status code)
  res.sendStatus = res.sendStatus || function _sendStatusShim (statusCode) {

    // Get the status codes from the HTTP module
    var statusCodes = http.STATUS_CODES;

    // If this is a known code, use its name (e.g. "FORBIDDEN" or "OK").
    // Otherwise, just turn the number into a string.
    var body = statusCodes[statusCode] || String(statusCode);

    // Set the response status code.
    res.statusCode = statusCode;

    // Send the response.
    return res.send(body);
  };

  // res.send()
  res.send = res.send || function _sendShim (data, noLongerSupported) {
    if (!_.isUndefined(noLongerSupported)) {
      throw new Error('The 2-ary usage of `res.send()` is no longer supported in Express 4/Sails v1.  Please use `res.status(statusCode).send(body)` instead.');
    }

    // Don't allow users to respond/redirect more than once per request
    // FUTURE: prbly move this check to our `res.writeHead()` impl
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

    // Ensure headers are set
    _.extend(res.headers, res._headers);

    // Ensure statusCode is set
    res.statusCode = res.statusCode || 200;

    // if a `_clientCallback` was specified, we'll skip the streaming stuff for res.send().
    if (res._clientCallback) {

      // Hard-code `res.body` rather than writing to the stream.
      // (but don't include body if it is empty)
      if (!_.isUndefined(data)) {
        res.body = data;
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
    if (!_.isUndefined(data)) {

      try {

        var toWrite;

        // If the data is already a string, don't stringify it.
        // (This allows for sending plain text, XML, etc.)
        if (_.isString(data)) {
          toWrite = data;
        }
        else {
          try {
            toWrite = JSON.stringify(data);
            if (!res.get('content-type')) {
              res.set('content-type', 'application/json');
            }
          }
          catch(e) {
            throw new Error(
              'Failed to stringify specified JSON response body :: ' + util.inspect(data) +
              '\nError:\n' + util.inspect(e)
            );
          }
          // if (process.env.NODE_ENV !== 'production') {
          //   toWrite = e.message;
          // }
        }//>-

        res.write(toWrite);

      } catch (e) {
        if (req._sails && req._sails.log && req._sails.log.error) {
          req._sails.log.error(e);
        }
        else {
          console.error(e);
        }
        res.statusCode = 500;
      }
    }//</if data was defined>

    // End the `res` stream.
    res.end();
  };

  // res.json()
  res.json = res.json || function _jsonShim (data, noLongerSupported) {
    if (!_.isUndefined(noLongerSupported)) {
      throw new Error('The 2-ary usage of `res.json()` is no longer supported in Express 4/Sails v1.  Please use `res.status(statusCode).json(body)` instead.');
    }

    // If data is a string, JSON stringify it.
    // (Otherwise, we can just rely on `send` to do that for us.)
    if (_.isString(data)) {
      data = JSON.stringify(data);
      res.set('content-type', 'application/json');
    }

    return res.status(res.statusCode || 200).send(data);
  };

  // res.render()
  res.render = res.render || function _renderShim (relativeViewPath, locals, cb) {
    if (_.isFunction(locals)) {
      cb = locals;
      locals = {};
    }

    try {
      if (!req._sails) {
        throw new Error('Cannot call res.render() - `req._sails` was not attached');
      }
      if (!req._sails.renderView) {
        throw new Error('Cannot call res.render() - `req._sails.renderView` was not attached (perhaps `views` hook is not enabled?)');
      }

      res.set('content-type', 'text/html');

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // TODO:
      // Instead of this shim, turn `sails.renderView` into something like
      // `sails.hooks.views.render()`, and then call it.
      throw flaverr({statusCode: 501}, new Error('Not implemented in core yet'));
      //
      // Instead, do something like the following:
      // ```
      // var html;
      // // ...
      // if (cb) {
      //   return cb(undefined, html);
      // }
      // else {
      //   return res.status(200).send(html);
      // }
      // ```
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    } catch (e) {
      if (cb) { return cb(e); }

      // NOTE: We don't try to use res.serverError() here because we might
      // _already_ be in the midst of a res.serverError() call.

      if (req._sails && req._sails.log && req._sails.log.error) {
        req._sails.log.error('res.render() failed: ', e);
      }
      else {
        console.error('res.render() failed: ', e);
      }

      if (process.env.NODE_ENV === 'production') { return res.status(e.statusCode||500).send(e.message); }
      else { return res.status(e.statusCode||500).send(); }
    }

  };

  // res.redirect()
  res.redirect = res.redirect || function _redirectShim (address, noLongerSupported) {
    if (!_.isUndefined(noLongerSupported)) {
      throw new Error('The 2-ary usage of `res.redirect()` is no longer supported in Express 4/Sails v1.  Please use `res.status(statusCode).redirect(address)` instead.');
    }

    // For familiarity, set content-type header:
    res.set('content-type', 'text/html');

    // Set location header
    res.set('Location', address);

    return res.status(res.statusCode||302).send('Redirecting to '+encodeURI(address));
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
