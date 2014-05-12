/**
 * Module dependencies
 */
var _ = require('lodash');
var MockReq = require('mock-req');

// var ExpressRequest		= require('express/lib/request')
// 	, express = require('express');


/**
 * Factory which builds generic Sails request object (i.e. `req`).
 *
 * This generic implementation of `req` forms the basis for
 * Sails' transport-agnostic support of Connect/Express
 * middleware.  Used by hooks (i.e. sockets) but also for
 * tests-- both at the app-level and in Sails core.
 *
 * @return {Request} simulated HTTP request object
 */

module.exports = function buildRequest (_req) {

  var req;
  if (typeof _req === 'object' && _req.method && _req.url && _req.headers) {
    req = _req;
  }
  else {
    req = new MockReq({
      method: _req.method,
      headers: _req.headers,
      url: _req.url
    });
  }

  function FakeSession() {}

  return _.defaults(req || {}, {
    params: {},
    session: new FakeSession(),
    query: {},
    body: {},
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
    wantsJSON: true,
    method: 'GET'
  });
};

// module.exports = (function mock_req (){

// 	var req = Request;

// 	// Examine something like [shot](https://github.com/spumko/shot/)
// 	// for the streaming methods.

// 	//
// 	// Express methods/properties
// 	//


// 	// Create a stub express 'app' object.
// 	//
// 	// We need to pass it in as `req.app` for Express'
// 	// default `req` implementation to work.
// 	//
// 	// Just like in Express (at least as of 3.4.x), `req.app.settings`
// 	// changed during a request will persist only for the remainder of that request.
// 	req.app = express();


// 	// Reasonable defaults
// 	req.params = req.params || [],
// 	req.query = req.query || {},
// 	req.body = req.body || {},
// 	req.method = 'GET',
// 	req.headers = {
// 		host: 'pretend.com'
// 	};




// 	//
// 	// Sails extensions
// 	//

// 	req.transport = 'mock';

// 	// TODO: get the request (from the `request` hook)


// 	// require-cache will automatically cache this mocked request object
// 	// to avoid running this block of code more than once.
// 	return req;

// })();





// ////////////////////////////////////////////////////////////////////////////////
// ///
// ///
// ///
// ///
// /**
//  * Test fixture to send requests to Sails.
//  *
//  * @api private
//  */

// function _req(req) {
// 	var _enhancedReq = util.defaults(req || {}, {
// 		params: {},
// 		url: '/',
// 		param: function(paramName) {
// 			return _enhancedReq.params[paramName];
// 		},
// 		wantsJSON: true,
// 		method: 'get'
// 	});

// 	return _enhancedReq;
// }


// /**
//  * Test fixture to receive responses from Sails.
//  *
//  * @api private
//  */

// function _res(res) {

// 	var _enhancedRes = util.defaults(res || {}, {
// 		send: function( /* ... */ ) {
// 			var args = _normalizeResArgs(Array.prototype.slice.call(arguments));

// 			_enhancedRes._cb(null, {
// 				body: args.other,
// 				headers: {},
// 				status: args.statusCode || 200
// 			});
// 		},
// 		json: function(body, statusCode) {

// 			// Tolerate bad JSON
// 			var json = util.stringify(body);
// 			if (!json) {
// 				var failedStringify = new Error(
// 					'Failed to stringify specified JSON response body :: ' + body
// 				);
// 				return _enhancedRes.send(failedStringify.stack, 500);
// 			}

// 			return _enhancedRes.send(json, statusCode);
// 		}
// 	});

// 	return _enhancedRes;
// }


// /**
//  * As long as one of them is a number (i.e. a status code),
//  * allows a 2-nary method to be called with flip-flopped arguments:
//  *		method( [statusCode|other], [statusCode|other] )
//  *
//  * This avoids confusing errors & provides Express 2.x backwards compat.
//  *
//  * E.g. usage in res.send():
//  *		var args		= normalizeResArgs.apply(this, arguments),
//  *			body		= args.other,
//  *			statusCode	= args.statusCode;
//  *
//  * @api private
//  */
// function _normalizeResArgs(args) {

// 	// Traditional usage:
// 	// `method( other [,statusCode] )`
// 	var isTraditionalUsage =
// 		'number' !== typeof args[0] &&
// 		(!args[1] || 'number' === typeof args[1]);

// 	if (isTraditionalUsage) {
// 		return {
// 			statusCode: args[1],
// 			other: args[0]
// 		};
// 	}

// 	// Explicit usage, i.e. Express 3:
// 	// `method( statusCode [,other] )`
// 	return {
// 		statusCode: args[0],
// 		other: args[1]
// 	};
// }










// //
// // TODO:
// // replace w/ req.js and res.js:
// //

/**
 * Ensure that request object has a minimum set of reasonable defaults.
 * Used primarily as a test fixture.
 *
 * @api private
 */

// function FakeSession() {}

// function reasonableDefaultRequest(req) {
//   // if (req.params && req.method) {
//   //   return req;
//   // }
//   // else {
//     return _.defaults(req || {}, {
//       params: {},
//       session: new FakeSession(),
//       query: {},
//       body: {},
//       param: function(paramName) {

//         var key, params = {};
//         for (key in (req.params || {}) ) {
//           params[key] = params[key] || req.params[key];
//         }
//         for (key in (req.query || {}) ) {
//           params[key] = params[key] || req.query[key];
//         }
//         for (key in (req.body || {}) ) {
//           params[key] = params[key] || req.body[key];
//         }

//         // Grab the value of the parameter from the appropriate place
//         // and return it
//         return params[paramName];
//       },
//       wantsJSON: true,
//       method: 'GET'
//     });
//   // }
// }
