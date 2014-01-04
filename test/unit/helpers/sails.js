/**
 * Module dependencies
 */
var Sails = require('root-require')('lib/app');

/**
 * Manage an instance of Sails
 * 
 * @type {Object}
 */
var helper = {


	/**
	 * Can call:
	 *	-> helper.load()
	 *	-> helper.load.withAllHooksDisabled()
	 */
	load: (function () {

		var _load = function () {
			_with('default settings', {}, 750);
		};

		_load.withAllHooksDisabled = function () {
			_with('all hooks disabled', {
				log: {level: 'error'},
				globals: false,
				loadHooks: []
			}, 500);
		};

		return _load;

	})()
};



module.exports = helper;






/**
 * Setup and teardown a Sails instance for testing.
 * 
 * @param  {String} description
 * @param  {Object} sailsOpts
 * @param  {Integer} msThreshold [before we consider it "slow"]
 * 
 * @api private
 */
function _with (description, sailsOpts, msThreshold) {


	it('sails loaded (with ' + description + ')', function (done) {
		if (msThreshold) { this.slow(msThreshold); }

		var self = this;
		self.sails = new Sails();
		self.sails.load(sailsOpts || {}, function (err) {
			done(err, self.sails);
		});
	});

	after(function teardown(done) {
		this.sails.lower(done);
	});

}
