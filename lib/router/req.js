/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var defaultsDeep = require('merge-defaults');
var MockReq = require('mock-req');


/**
 * Factory which builds generic Sails request object (i.e. `req`).
 *
 * This generic implementation of `req` forms the basis for
 * Sails' transport-agnostic support of Connect/Express
 * middleware.  Used by hooks (i.e. sockets) but also for
 * tests-- both at the app-level and in Sails core.
 *
 * @return {Request} simulated HTTP request object
 * @idempotent
 */

module.exports = function buildRequest (_req) {
  _req = _req||{};

  var req;

  // If `_req` appears to be a stream (duck-typing), then don't try
  // and turn it into a mock stream again.
  if (typeof _req === 'object' && _req.read) {
    req = _req;
  }
  else {

    // TODO: send a PR to mock-req with a fix for this
    if (_req.headers && typeof _req.headers === 'object') {
      // Strip undefined headers
      _.each(_req.headers, function (headerVal, headerKey) {
        if (_.isUndefined(headerVal)){
          delete _req.headers[headerKey];
        }
      });
      // Make sure all remaining headers are strings
      _req.headers = _.mapValues(_req.headers, function (headerVal, headerKey) {
        if (typeof headerVal !== 'string') {
          headerVal = ''+headerVal+'';
        }
        return headerVal;
      });
    }

    // Create a mock IncomingMessage stream.
    req = new MockReq({
      method: _req && (_.isString(_req.method) ? _req.method.toUpperCase() : 'GET'),
      headers: _req && _req.headers || {},
      url: _req && _req.url
    });

    // Now pump client request body to the mock IncomingMessage stream (req)
    // Req stream ends automatically if this is a GET or HEAD or DELETE request
    // (since there is no request body in that case) so no need to do it again.
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {

      // Only write the body if there IS a body.
      if (req.body) {
        req.write(req.body);
      }
      req.end();
    }
  }

  // Track request start time
  req._startTime = new Date();

  // TODO: add all the other methods in core

  // Provide defaults for other request state and methods
  req = defaultsDeep(req, {
    params: [],
    query: (_req && _req.query) || {},
    body: (_req && _req.body) || {},
    param: function(paramName, defaultValue) {

      var key, params = {};
      for (key in (req.params || {}) ) {
        params[key] = params[key] || req.params[key];
      }
      for (key in (req.query || {}) ) {
        params[key] = params[key] || req.query[key];
      }
      for (key in (req.body || {}) ) {
        params[key] = params[key] || req.body[key];
      }

      // Grab the value of the parameter from the appropriate place
      // and return it
      return params[paramName] || defaultValue;
    },
    wantsJSON: (_req && _req.wantsJSON) || true,
    method: 'GET'
  }, _req||{});

  return req;
};

