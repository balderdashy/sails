/**
 * Module dependencies
 */
var _ = require('lodash');
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

		var testDefaults = { log: {level: 'error'} };

		var _load = function (options) {
			
			// Defaults
			// (except use test defaults)
			if (!options) {
				_with('default settings', testDefaults, 750);
				return;
			}

			// Specified options + defaults
			// (except default log level to 'error')
			var humanReadableOpts = require('util').inspect(options);
			_with(humanReadableOpts,
				_.defaults(options, testDefaults),
				2000);

		};

		_load.withAllHooksDisabled = function () {
			_with('all hooks disabled', {
				log: {level: 'error'},
				globals: false,
				loadHooks: []
			}, 500);
		};

		return _load;

	})(),


	/**
	 * @return {Sails} `sails` instance from mocha context
	 */
	get: function (passbackFn) {
		// Use mocha context to get a hold of the Sails instance
		it('should get a Sails instance', function () {
			passbackFn(this.sails);
		});
	}
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
		self.sails.load(sailsOpts || {}, done);
	});

	after(function teardown(done) {
		this.sails.lower(done);
	});

}
