/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var defaultsDeep = require('merge-defaults');// « TODO: Get rid of this
var MockReq = require('./mock-req');// «FUTURE: consolidate that into this file
var parseurl = require('parseurl');

/**
 * Factory which builds generic Sails request object (i.e. `req`).
 *
 * This generic implementation of `req` forms the basis for
 * Sails' transport-agnostic support of Connect/Express
 * middleware.  Used by hooks (i.e. sockets) but also for
 * tests-- both at the app-level and in Sails core.
 *
 * @param {Dictionary} _req
 *        the properties of this simulated request object that
 *        have been built up _so far_.
 *
 * @return {Request} simulated HTTP request object
 * @idempotent
 */

module.exports = function buildRequest (_req) {

  // Make sure _req is not undefined
  _req = _req||{};

  // Start our request object, which will be built by inheriting/transforming
  // properties of _req and adding some spice of our own
  var req;

  // Attempt to parse the URL in _req, so that we can get the querystring
  // and path.  (But if it fails for any reason, ignore the error and fall back
  // to an empty dictionary.)
  var parsedUrl;
  try {parsedUrl = parseurl(_req) || {};}
  catch (unusedErr) {parsedUrl = {};}

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
      _req.headers = _.mapValues(_req.headers, function (headerVal /*, headerKey*/) {
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

    // Add .get() and .header() methods to match express 3
    req.get = req.header = function (name) {
      switch (name = name.toLowerCase()) {
        case 'referer':
        case 'referrer':
          return this.headers.referrer || this.headers.referer;
        default:
          return this.headers[name];
      }
    };

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

  ////////////////////////////////////////////////////////////////////////////////
  // Note that other core methods _could_ be added here for use w/ the virtual
  // router.  But as per convo w/ dougwilson, the same _cannot_ be done for HTTP
  // requests coming out of Express.  They would either have to (a) rely on modifying
  // the HTTP request (IncomingMessage) prototype, or (B) rely on context (i.e. `this`),
  // which would require `_.bind()`-ing them to avoid issues when triggered from
  // userland code. And re: (B) at that point, the performance impact is effectively
  // the same as if they were attached on the fly on a per-request basis.
  //
  // So we only initially attach `req.*` methods & properties here which are _not_
  // already built-in to the mock request, and which are _not_ already taken care of
  // by hooks, AND which don't rely on `res` (because it hasn't been built yet).
  ////////////////////////////////////////////////////////////////////////////////

  // Provide defaults for other request state and methods
  req = defaultsDeep(req, {
    params: [],
    query: (_req && _req.query) || require('querystring').parse(parsedUrl.query) || {},
    body: (_req && _req.body) || {},
    param: function(paramName, defaultValue) {

      var key;
      var params = {};
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
      if (typeof params[paramName] !== 'undefined') {
        return params[paramName];
      } else {
        return defaultValue;
      }

    },
    wantsJSON: (_req && _req.wantsJSON === false) ? false : true,
    method: 'GET',
    originalUrl: _req.originalUrl || _req.url,
    path: _req.path || parsedUrl.pathname
  }, _req||{});

  return req;
};
