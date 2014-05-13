/**
 * Module dependencies.
 */

var _ = require('lodash');
var util = require('util');
var QS = require('querystring');
var buildReq = require('../router/req');
var buildRes = require('../router/res');
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
 * @return {Stream.Readable}
 *
 * @api public
 */

module.exports = function request( /* address, body, cb */ ) {

  var sails = this;

  //
  // Body params may be passed in to DELETE, HEAD, and GET requests,
  // even though these types of requests don't normally contain a body.
  // (this method just serializes them as if they were sent in the querystring)
  //


  //
  // TODO:
  // Support other methods on req and res, and parse the querystring.
  // Implement basic bodyParser shim for non-http requests for consistency
  // in testing and usage.
  // (i.e. merge w/ lib/router/req.js and lib/hooks/sockets/lib/interpreter/*.js)
  //


  // Normalize usage
  var address = arguments[0];
  var body;
  var cb;
  if (arguments[2]) {
    cb = arguments[2];
    body = arguments[1];
  }
  if (_.isFunction(arguments[1])) {
    cb = arguments[1];
  } else if (arguments[1]) {
    body = arguments[1];
  }

  // If route has an HTTP verb (e.g. `get /foo/bar`, `put /bar/foo`, etc.) parse it out,
  var method = sails.util.detectVerb(address).verb;
  method = method ? method.toUpperCase() : 'GET';
  var url = sails.util.detectVerb(address).original;

  // Parse query string (`req.query`)
  var queryStringPos = url.indexOf('?');

  // If this is a GET, HEAD, or DELETE request, treat the "body"
  // as parameters which should be serialized into the querystring.
  if (_.isObject(body) && _.contains(['GET', 'HEAD', 'DELETE'], method)) {

    var stringifiedParams = QS.stringify(body);

    if (queryStringPos === -1) {
      url += '?' + stringifiedParams;
    } else {
      url = url.substring(0, queryStringPos) + '?' + stringifiedParams;
    }
  }


  // TODO: return Deferred
  return _requestHelper({
    method: method,
    url: url,
    body: body
  }, cb);

  function _requestHelper(opts, cb) {

    opts.method = opts.method && opts.method.toUpperCase() || 'GET';
    opts.headers = opts.headers || {};

    // Build HTTP Server Request
    var req = buildReq(opts, {});

    // Build HTTP Server Response
    var res = buildRes(req, {});


    // Build HTTP Client Response stream
    var clientRes = new MockClientResponse();
    clientRes.on('finish', function() {

      // Status code and headers
      clientRes.headers = res.headers;
      clientRes.statusCode = res.statusCode;

      // Only dump the buffer if a callback was supplied
      if (cb) {
        clientRes.body = Buffer.concat(clientRes._readableState.buffer).toString();
        try {
          clientRes.body = JSON.parse(clientRes.body);
        } catch (e) {}

        // Don't include body if it is empty
        if (!clientRes.body) delete clientRes.body;

        // If status code is indicative of an error, send the
        // response body or status code as the first error argument.
        if (clientRes.statusCode < 200 || clientRes.statusCode >= 400) {
          var error = new Error();
          if (clientRes.body) {error.body = clientRes.body;}
          error.status = clientRes.statusCode;
          error.message = util.inspect(error.body || error.status);
          return cb(error);
        }
        else {
          return cb(null, clientRes, clientRes.body);
        }
      }
    });
    clientRes.on('error', function(err) {
      err = err || new Error('Error on response stream');
      if (cb) return cb(err);
      else return clientRes.emit('error', err);
    });

    // Set up all things pushed to `res` on the server
    // to be piped down the client response stream.
    res.pipe(clientRes);

    // To kick things off, pass `req` and `res` to the Sails router
    sails.router.route(req, res);

    // Write client request body to the simulated `req` (IncomingMessage)
    // Req stream ends automatically if this is a GET or HEAD request
    // - no need to do it again
    if (opts.method !== 'GET' && opts.method !== 'HEAD' && opts.method !== 'DELETE') {
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



function MockClientResponse() {
  Transform.call(this);
}
util.inherits(MockClientResponse, Transform);
MockClientResponse.prototype._transform = function(chunk, encoding, next) {
  this.push(chunk);
  next();
};

