/**
 * Module dependencies
 */
var Sails = require('../../lib/app');


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
	bdd: function (options) {
		before(helper.new(options));
		after(helper.teardown(options));
	},
	
	new: function (options) {
		return function (cb) {
			var self = this;
			self.sails = new Sails();
			self.sails.load(options, function (err) {
				cb(err, self.sails);
			});
		};
	},

	teardown: function () {
		return function (cb) {
			this.sails.lower(cb);
		};
	}
};

module.exports = helper;