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

  // Set session (or build up a fake one)
  req.session = _req.session || {};

  // Provide defaults for other request state and methods
  req = defaultsDeep(req, {
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




//       //////////////////////////////////////////////////////////////////////////
/////       //////////////////////////////////////////////////////////////////////////
///        || ////////////////////////////////////////////////////////////////////////
///// TODO \/  /////////////////////////////////////////////////////////////////////////////
////////         /////////////////////////////////////////////////////////////////////////////
//////////          /////////////////////////////////////////////////////////////////////////////


// function FakeSession() {
//   // TODO: mimic the session store impl in sockets hook
//   // (all of this can drastically simplify that hook and consolidate
//   //  request interpreter logic)
// }





// function ToLoadSession(sails) {


//   /**
//    * Module dependencies.
//    */

//   var util = require('util');
//   var parseSignedCookie = require('cookie-parser').signedCookie;
//   var cookie = require('express/node_modules/cookie');
//   var ConnectSession = require('express/node_modules/connect').middleware.session.Session;
//   var getSDKMetadata = require('./getSDKMetadata');



//   /**
//    * Fired after a socket is connected
//    */

//   return function socketAttemptingToConnect(handshake, accept) {

//     // If a cookie override was provided in the query string, use it.
//     // (e.g. ?cookie=sails.sid=a4g8dsgajsdgadsgasd)
//     if (handshake.query.cookie) {
//       handshake.headers.cookie = handshake.query.cookie;
//     }

//     var sdk = getSDKMetadata(handshake);
//     sails.log.verbose(util.format('%s client (v%s) is trying to connect a socket...', sdk.platform, sdk.version));

//     var TROUBLESHOOTING =
//       'Perhaps you have an old browser tab open?  In that case, you can ignore this warning.' + '\n' +
//       'Otherwise, are you are trying to access your Sails.js ' + '\n' +
//       'server from a socket.io javascript client hosted on a 3rd party domain?  ' + '\n' +
//       ' *-> You can override the cookie for a user entirely by setting ?cookie=... in the querystring of ' + '\n' +
//       'your socket.io connection url on the client.' + '\n' +
//       ' *-> You can send a JSONP request first from the javascript client on the other domain ' + '\n' +
//       'to the Sails.js server to get the cookie first, then connect the socket.' + '\n' +
//       ' *-> For complete customizability, to override the built-in session assignment logic in Sails ' + '\n' +
//       'for socket.io requests, you can override socket.io\'s `authorization` logic with your own function ' + '\n' +
//       'in `config/sockets.js`. ' + '\n' +
//       'Or disable authorization for incoming socket connection requests entirely by setting `authorization: false`.' + '\n';


//     // Parse and decrypt cookie and save it in the handshake
//     if (!handshake.headers.cookie) {
//       return socketConnectionError(accept,
//         'Cannot load session for an incoming socket.io connection...  ' + '\n' +
//         'No cookie was sent!\n' +
//         TROUBLESHOOTING,
//         'Cannot load session. No cookie transmitted.'
//       );
//     }

//     // Decrypt cookie into session id using session secret
//     // Maintain sessionID in socket handshake so that the session
//     // can be queried before processing each incoming message from this
//     // socket in the future.
//     try {
//       handshake.cookie = cookie.parse(handshake.headers.cookie);
//       handshake.sessionID = parseSignedCookie(handshake.cookie[sails.config.session.key], sails.config.session.secret);
//     } catch (e) {
//       return socketConnectionError(accept,
//         'Unable to parse the cookie that was transmitted for an incoming socket.io connect request:\n' +
//         util.inspect(e) + '\n' + TROUBLESHOOTING,
//         'Cannot load session. Cookie could not be parsed.'
//       );
//     }


//     // Look up this socket's session id in the Connect session store
//     // and see if we already have a record of 'em.
//     sails.session.get(handshake.sessionID, function(err, session) {

//       // An error occurred, so refuse the connection
//       if (err) {
//         return socketConnectionError(accept,
//           'Error loading session during socket connection! \n' + err,
//           'Error loading session.');
//       }

//       // Cookie is present (there is a session id), but it doesn't
//       // correspond to a known session in the session store.
//       // So generate a new, blank session.
//       else if (!session) {
//         handshake.session = new ConnectSession(handshake, {
//           cookie: {
//             // Prevent access from client-side javascript
//             httpOnly: true
//           }
//         });
//         sails.log.verbose("Generated new session for socket....", handshake);

//         // TO_TEST:
//         // do we need to set handshake.sessionID with the id of the new session?

//         // TO_TEST:
//         // do we need to revoke/replace the cookie as well?
//         // how can we do that w/ socket.io?
//         // can we access the response headers in the http UPGRADE response?
//         // or should we just clear the cookie from the handshake and call it good?
//         // e.g
//         // var date = new Date();
//         // date.setTime(date.getTime()+(days*24*60*60*1000));
//         // var expires = "; expires="+date.toGMTString();
//         // handshake.headers.cookie = name+"="+value+expires+"; path=/";

//         accept(null, true);
//       }

//       // Parsed cookie matches a known session- onward!
//       else {

//         // Create a session object, passing our just-acquired session handshake
//         handshake.session = new ConnectSession(handshake, session);
//         sails.log.verbose("Connected socket to existing session....");
//         accept(null, true);
//       }
//     });
//   };


//   /**
//    * Fired when an internal server error occurs while authorizing the socket
//    */

//   function socketConnectionError(accept, devMsg, prodMsg) {
//     var msg;
//     if (sails.config.environment === 'development') {
//       msg = devMsg;
//     } else msg = prodMsg;
//     return accept(msg, false);
//   }

// };
