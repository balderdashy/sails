module.exports = function (sails) {

	/**
	 * Module dependencies.
	 */
	var _ = require('lodash'),
		Request = require('express/lib/request');


	/**
	 * Build mock request object for hooks (i.e. sockets)
	 * but also for tests in userspace, and core unit tests.
	 */
	var req = Request;
	req.transport = 'mock',

	// We need to pass in the app object 
	// from our slave instance of Express.
	req.app = sails.router._slave;

	// Reasonable defaults
	req.params = req.params || [],
	req.query = req.query || {},
	req.body = req.body || {},
	req.method = 'GET',
	req.url = 'http://pretend.com',
	req.headers = {
		host: 'pretend.com'
	};

	return req;
};









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