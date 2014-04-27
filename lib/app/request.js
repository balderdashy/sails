/**
 * Module dependencies.
 */

var _             = require('lodash');
var util = require('util');
var MockReq = require('mock-req');
var MockRes = require('mock-res');
var Transform = require('stream').Transform;


/**
 * Originate a new request instance and lob it at this Sails
 * app at the specified route `address`.
 *
 * Particularly useful for running unit/integration tests without
 * actually having to bind the HTTP and/or WebSocket servers to
 * a TCP port.
 *
 * @param  {String} address
 * @param  {Object} body
 * @param  {Function} cb
 * @return {JSDeferred}
 *
 * @api public
 */

module.exports = function request ( /* address, body, cb */ ) {

  var sails = this;

  // Normalize usage
  var address = arguments[0];
  var body;
  var cb;
  if (arguments[2]) {
    cb = arguments[2];
    body = arguments[1];
  }
  if ( _.isFunction(arguments[1]) ) {
    cb = arguments[1];
  }
  else if (arguments[1]) {
    body = arguments[1];
  }

  // If route has an HTTP verb (e.g. `get /foo/bar`, `put /bar/foo`, etc.) parse it out,
  var method = sails.util.detectVerb(address).verb;
  var url = sails.util.detectVerb(address).original;

  // TODO: return Deferred
  return _requestHelper({
    method: method,
    url: url,
    body: body
  }, cb);

  function _requestHelper (opts, cb) {

    opts.method = opts.method && opts.method.toUpperCase() || 'GET';
    opts.headers = opts.headers || {};

    // Build HTTP Client Response stream
    var clientRes = new MockClientResponse();
    clientRes.on('finish', function() {
      // Status code and headers
      clientRes.headers = res.headers;
      clientRes.statusCode = res.statusCode;

      // Only dump the buffer if a callback was supplied
      if (cb) {
        clientRes.body = Buffer.concat(this._readableState.buffer).toString();
        try {
          clientRes.body = JSON.parse(clientRes.body);
        }
        catch (e) {}

        // Don't include body if it is empty
        if (!clientRes.body) delete clientRes.body;

        return cb(null, clientRes, clientRes.body);
      }
    });
    clientRes.on('error', function (err) {
      err = err || new Error('Error on response stream');
      if (cb) return cb(err);
      else return clientRes.emit('error',err);
    });


    // Build HTTP Server Response
    var res = new MockRes();

    // Build HTTP Server Request
    var req = new MockReq({
      method: opts.method,
      url: opts.url,
      headers: opts.headers
    });



    /// TODO: merge w/ lib/router/req.js and lib/hooks/sockets/lib/interpreter/*.js
    req.body = '';
    req.on('readable', function () {
      var chunk;
      while (null !== (chunk = req.read())) {
        req.body += chunk;
      }
    });
    req.on('end', function () {
      try { req.body = JSON.parse(req.body); }
      catch (e) {}

      // Set up all things pushed to `res` on the server
      // to be piped down the client response stream.
      res.pipe(clientRes);

      // Pass `req` and `res` to Sails
      sails.router.route(req, res);

    });

    // Req stream ends automatically if this is a GET or HEAD request.
    if (opts.method !== 'GET' && opts.method !== 'HEAD') {
      // Only write the body if there IS a body.
      if (opts.body) {
        req.write(opts.body);
      }
      req.end();
    }


    // Return clientRes stream
    return clientRes;
  }
};






function MockClientResponse(){
  Transform.call(this);
}
util.inherits(MockClientResponse, Transform);
MockClientResponse.prototype._transform = function(chunk, encoding, next) {
  this.push(chunk);
  next();
};


