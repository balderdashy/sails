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
	}
};

module.exports = helper;
