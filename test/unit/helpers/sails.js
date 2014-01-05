/**
 * Module dependencies
 */
var _ = require('lodash');
var util = require('util');
var should = require('should');
var domain = require('domain');
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
	 *	-> helper.load.expectingTerminatedProcess()
	 */
	load: (function () {

		/**
		 * _cleanOptions()
		 * 
		 * @param {Object} options
		 * @type {Function}
		 * @api private
		 */
		function _cleanOptions (options) {
			var testDefaults = { log: {level: 'error'} };
			options = _.isObject(options) ? options : {};
			return _.defaults(options, testDefaults);
		}



		var _load = function (options) {
			
			var testDescription, msSlowThreshold;
			var sailsOpts = _cleanOptions(options);

			// Defaults
			// (except use test defaults)
			if (!_.isObject(options)) {
				testDescription = 'default settings';
				msSlowThreshold = 750;
			}
			else {
				// Specified options + defaults
				// (except default log level to 'error')
				testDescription = util.inspect(options);
				msSlowThreshold = 2000;
			}


			return _with(testDescription, sailsOpts, msSlowThreshold);
		};

		_load.withAllHooksDisabled = function () {
			return _with('all hooks disabled', {
				log: {level: 'error'},
				globals: false,
				loadHooks: []
			}, 500);
		};

		_load.expectTerminatedProcess = function( options ) {
			options = _.isObject(options) ? options : {};
			var sailsOpts = _cleanOptions(options);

			it(', sails should deliberately terminate process', function (done) {
				var sails = new Sails();
				
				// Use error domain to catch failure
				var DELIBERATE_ERROR = domain.create();
				DELIBERATE_ERROR.on('error', function (err) {
					return done();
				});
				DELIBERATE_ERROR.run(function () {
					sails.load(sailsOpts || {}, function (err) {
						var e = 
						'Should not have made it to load() ' +
						'callback, with or without an error!';
						if (err) e+='\nError: ' + util.inspect(err);
						return done(new Error(e));
					});
				});

			});
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
 * @returns {Chainable}
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


