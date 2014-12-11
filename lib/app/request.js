/**
 * Module dependencies.
 */

var _ = require('lodash');
var util = require('util');
var QS = require('querystring');
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



  // Build HTTP Client Response stream
  var clientRes = new MockClientResponse();
  clientRes.on('finish', function() {

    // console.log('* * * * * * * * * * ');
    // console.log('clientRes finished!');
    // console.log('* * * * * * * * * * ');

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
    // console.log('* * * * * * * * * * ');
    // console.log('clientRes errored!!!!!!!!!');
    // console.log('* * * * * * * * * * ');
    err = err || new Error('Error on response stream');
    if (cb) return cb(err);
    else return clientRes.emit('error', err);
  });

  // To kick things off, pass `opts` (as req) and `res` to the Sails router
  sails.router.route({
    method: method,
    url: url,
    body: body
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

