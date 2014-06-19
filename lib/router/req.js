/**
 * Module dependencies
 */
var _ = require('lodash');
_.defaultsDeep = require('merge-defaults');
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
  if (typeof _req === 'object' && _req.read) {
    req = _req;
  }
  else {

    // TODO: send a PR to mock-req with a fix for this
    if (_req.headers && typeof _req.headers === 'object') {
      _req.headers = _.mapValues(_req.headers, function (headerVal, headerKey) {
        if (typeof headerVal !== 'string') {
          headerVal = ''+headerVal+'';
        }
        return headerVal;
      });
    }

    req = new MockReq({
      method: _req && _req.method || 'GET',
      headers: _req && _req.headers || {},
      url: _req && _req.url
    });
  }

  function FakeSession() {
    // TODO: mimic the session store impl in sockets hook
    // (all of this can drastically simplify that hook and consolidate
    //  request interpreter logic)
  }

  // Set session
  req.session = (_req && _req.session) || new FakeSession();

  // Provide defaults for other request state and methods
  req = _.defaultsDeep(req, {
    params: [],
    query: (_req && _req.query) || {},
    body: (_req && _req.body) || {},
    param: function(paramName) {

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
      return params[paramName];
    },
    wantsJSON: (_req && _req.wantsJSON) || true,
    method: 'GET'
  }, _req||{});

  return req;
};



