/**
 * Module dependencies
 */
var Sails = require('../../lib/app');
var util = require('sails-util');

/**
 * Manage an instance of Sails
 * 
 * @type {Object}
 */
var helper = {

	/**
	 * Set up before() and after() mocha hooks.
	 * 
	 * @param  {Object} options [for Sails load]
	 */
	bindLifecycle: function (options) {
		before(helper.new(options));
		after(helper.teardown(options));
	},
	
	new: function (options) {
		return function (done) {
			var self = this;
			self.sails = new Sails();
			self.sails.load(options, function (err) {
				done(err, self.sails);
			});
		};
	},

	teardown: function () {
		return function (done) {
			this.sails.lower(done);
		};
	},


	/**
	 * Send a mock request to the instance of Sails
	 * in the test context.
	 *
	 * @param {String} url		[relative URL]
	 * @param {Object} options
	 */
	request: function ( url, options ) {
		return function (done) {

			var _fakeClient = function (err, response) {
				if (err) return done(err);
				this.response = response;
				done();
			};

			this.sails.emit('router:request', _req(), _res(), _fakeClient);
		};
	}
};

module.exports = helper;



/**
 * Ensure that request object has a minimum set of reasonable defaults.
 * Used primarily as a test fixture.
 *
 * @api private
 */

function _req ( req ) {
	return util.defaults(req || {}, {
		params: {},
		url: '/',
		param: function(paramName) {
			return req.params[paramName];
		},
		wantsJSON: true,
		method: 'get'
	});
}


/**
 * Test fixture to send requests and receive responses from Sails.
 *
 * @api private
 */

function _res (res) {

	var _enhancedRes = util.defaults(res || {}, {
		send: function(body, statusCode) {
			_enhancedRes._cb(null, {
				body: body,
				headers: {},
				status: statusCode || 200
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


