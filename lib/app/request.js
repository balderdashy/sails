/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var Transform = require('stream').Transform;
var QS = require('querystring');
var detectVerb = require('../util/detect-verb');


/**
 * Originate a new client request instance and lob it at this Sails
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


  // Normalize usage
  var address = arguments[0];
  var body;
  var cb;

  var method;
  var headers;
  var url;

  // Usage:
  // sails.request(opts, cb)
  // • opts.url
  // • opts.method
  // • opts.params
  // • opts.headers
  //
  // (`opts.url` is required)
  if (_.isObject(arguments[0]) && arguments[0].url) {
    url = detectVerb(arguments[0].url).original;
    method = arguments[0].method || detectVerb(arguments[0].url).verb;
    headers = arguments[0].headers || {};
    body = arguments[0].params || arguments[0].data || {};
  }
  // console.log('called sails.request() ');
  // console.log('headers: ',headers);
  // console.log('method: ',method);


  // Usage:
  // sails.request(address, [params], cb)
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
  // (unless method or url was explicitly defined)
  method = method || detectVerb(address).verb;
  method = method ? method.toUpperCase() : 'GET';
  url = url || detectVerb(address).original;

  // Parse query string (`req.query`)
  var queryStringPos = url.indexOf('?');

  // If this is a GET, HEAD, or DELETE request, treat the "body"
  // as parameters which should be serialized into the querystring.
  if (_.isObject(body) && _.includes(['GET', 'HEAD', 'DELETE'], method)) {

    var stringifiedParams = QS.stringify(body);

    if (queryStringPos === -1) {
      url += '?' + stringifiedParams;
    } else {
      url = url.substring(0, queryStringPos) + '?' + stringifiedParams;
    }
  }



  // Build HTTP Client Response stream
  var clientRes = new MockClientResponse();
  clientRes.on('finish', function() {

    // console.log('clientRes finished. Headers:',clientRes.headers);

    // Only dump the buffer if a callback was supplied
    if (cb) {

      // Attempt to read the response buffer into a string
      try {
        clientRes.body = clientRes.read();
        clientRes.body = clientRes.body.toString();
      } catch (unusedErr) {}

      // Don't include body if it is empty.
      if (!clientRes.body) {delete clientRes.body;}

      // Now, if appropriate, parse the body as JSON.
      // (Attempt to parse as JSON if the content-type response header indicates it
      // would be a good idea -- and of course if there's a body.)
      if (!_.isUndefined(clientRes.body) && clientRes.headers['content-type'] === 'application/json') {
        clientRes.body = JSON.parse(clientRes.body);
      }

      // If status code is indicative of an error, send the
      // response body or status code as the first error argument.
      if (clientRes.statusCode < 200 || clientRes.statusCode >= 400) {
        var error = new Error(util.inspect(clientRes.body || clientRes.statusCode));
        if (clientRes.body) {error.body = clientRes.body;}
        error.status = clientRes.statusCode;
        return cb(error);
      }
      else {
        return cb(undefined, clientRes, clientRes.body);
      }
    }
  });
  clientRes.on('error', function(err) {
    err = err || new Error('Error on response stream');
    if (cb) { return cb(err); }
    else { return clientRes.emit('error', err); }
  });

  // To kick things off, pass `opts` (as req) and `res` to the Sails router
  sails.router.route({
    method: method,
    url: url,
    body: body,
    headers: headers || {}
  }, {
    _clientRes: clientRes
  });

  // Return clientRes stream
  return clientRes;

};



function MockClientResponse() {
  Transform.call(this);
}
util.inherits(MockClientResponse, Transform);
MockClientResponse.prototype._transform = function(chunk, encoding, next) {
  this.push(chunk);
  next();
};

