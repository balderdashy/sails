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
			this.sails.emit('router:request', _req(), _res(), function (err, response) {
				console.log('YAAAAAAAOW CALLBACK');
				if (err) return done(err);
				this.response = response;
				done();
			});
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
 * Ensure that response object has a minimum set of reasonable defaults
 * Used primarily as a test fixture.
 *
 * @api private
 */

function _res (res) {
	return util.defaults(res || {}, {
		send: function(body, statusCode) {
			res._cb(null, body, statusCode);
		},
		json: function(body, statusCode) {
			
			// Tolerate bad JSON
			var json = util.stringify(body);
			if ( !json ) {
				var failedStringify = new Error(
					'Failed to stringify specified JSON response body :: ' + body
				);
				return res.send(failedStringify.stack, 500);
			}

			return res.send(json,statusCode);
		}
	});
}


