/**
 * Module dependencies
 */
var util = require ('sails-util');





var helper = {

	/**
	 * Send a mock request to the instance of Sails in the test context.
	 *
	 * @param {String} url		[relative URL]
	 * @param {Object} options
	 *
	 * @return {Function}		[bdd]
	 */
	request: function ( url, options ) {
		return function (done) {

			var self = this;
			var _fakeClient = function (err, response) {
				if (err) return done(err);
				self.response = response;
				done();
			};

			// Emit a request event (will be intercepted by the Router)
			this.sails.emit('router:request', _req(), _res(), _fakeClient);
		};
	},



	/**
	 * Bind a route.
	 *
	 * @param {String|RegExp} path
	 * @param {String|Object|Array|Function} target
	 * @param {String} verb (optional)
	 * @param {Object} options (optional)
	 * 
	 * @return {Function}		[bdd]
	 */
	
	bind: function () {
		var args = Array.prototype.slice.call(arguments);
		return function () {
			this.sails.router.bind.apply(this.sails.router, args);
		};
	}
};
module.exports = helper;






// Private methods

/**
 * Test fixture to send requests to Sails.
 *
 * @api private
 */

function _req ( req ) {
	var _enhancedReq = util.defaults(req || {}, {
		params: {},
		url: '/',
		param: function(paramName) {
			return _enhancedReq.params[paramName];
		},
		wantsJSON: true,
		method: 'get'
	});

	return _enhancedReq;
}


/**
 * Test fixture to receive responses from Sails.
 *
 * @api private
 */

function _res (res) {

	var _enhancedRes = util.defaults(res || {}, {
		send: function(/* ... */) {
			var args = _normalizeResArgs(Array.prototype.slice.call(arguments));

			_enhancedRes._cb(null, {
				body: args.other,
				headers: {},
				status: args.statusCode || 200
			});
		},
		json: function(body, statusCode) {
			
			// Tolerate bad JSON
			var json = util.stringify(body);
			if ( !json ) {
				var failedStringify = new Error(
					'Failed to stringify specified JSON response body :: ' + body
				);
				return _enhancedRes.send(failedStringify.stack, 500);
			}

			return _enhancedRes.send(json,statusCode);
		}
	});

	return _enhancedRes;
}


/**
 * As long as one of them is a number (i.e. a status code),
 * allows a 2-nary method to be called with flip-flopped arguments:
 *		method( [statusCode|other], [statusCode|other] )
 *
 * This avoids confusing errors & provides Express 2.x backwards compat.
 *
 * E.g. usage in res.send():
 *		var args		= normalizeResArgs.apply(this, arguments),
 *			body		= args.other,
 *			statusCode	= args.statusCode;
 * 
 * @api private
 */
function _normalizeResArgs( args ) {

	// Traditional usage:
	// `method( other [,statusCode] )`
	var isTraditionalUsage = 
		'number' !== typeof args[0] && 
		( !args[1] || 'number' === typeof args[1] );

	if ( isTraditionalUsage ) {
		return {
			statusCode: args[1],
			other: args[0]
		};
	}

	// Explicit usage, i.e. Express 3:
	// `method( statusCode [,other] )`
	return {
		statusCode: args[0],
		other: args[1]
	};
}

