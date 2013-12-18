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
var helper = function () {
	_with('default settings', {}, 750);
};


helper.allHooksDisabled = function () {
	_with('all hooks disabled', {
		log: {level: 'error'},
		globals: false,
		loadHooks: []
	}, 500);
};


/**
 * Setup and teardown a Sails instance for testing.
 * 
 * @param  {[type]} description [description]
 * @param  {[type]} sailsOpts   [description]
 * @param  {[type]} msThreshold [description]
 * @return {[type]}             [description]
 */
function _with (description, sailsOpts, msThreshold) {


	it('sails loaded (with ' + description + ')', function (done) {
		if (msThreshold) { this.slow(msThreshold); }

		var self = this;
		self.sails = new Sails();
		self.sails.load(sailsOpts || {}, function (err) {
			done(err, this.sails);
		});
	});

	after(function teardown(done) {
		this.sails.lower(done);
	});

}

module.exports = helper;
