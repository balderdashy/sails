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
   *  -> helper.load()
   *  -> helper.load.withAllHooksDisabled()
   *  -> helper.load.expectingTerminatedProcess()
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
      var testDefaults = { log: {level: 'error'}, globals: false };
      options = _.isObject(options) ? options : {};
      return _.defaults(options, testDefaults);
    }


    /**
     * This function is returned by this test helper
     * to be called by subsequent tests.
     *
     * @param  {Object} options
     * @return {SJSApp}
     */
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


    /**
     * [withAllHooksDisabled description]
     * @return {[type]} [description]
     */
    _load.withAllHooksDisabled = function () {
      return _with('all hooks disabled', {
        log: {level: 'error'},
        globals: false,
        loadHooks: []
      }, 500);
    };


    /**
     * [expectFatalError description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _load.expectFatalError = function( options ) {
      options = _.isObject(options) ? options : {};
      var sailsOpts = _cleanOptions(options);

      it(', sails should deliberately terminate process', function (done) {
        var sails = new Sails();

        // TODO:
        // Pull this error domain into the core and
        // wrap the hook loading process (or a comparable solution.)
        // Should not have to do this here!

        // Use error domain to catch failure
        var deliberateErrorDomain = domain.create();
        deliberateErrorDomain.on('error', function (err) {
          console.log('domain emitted error', err);
          deliberateErrorDomain.exit();
          return done();
        });
        deliberateErrorDomain.run(function () {
          sails.load(sailsOpts || {}, function (err) {
            var e =
            'Should not have made it to load() ' +
            'callback, with or without an error!';
            if (err) e+='\nError: ' + util.inspect(err);
            deliberateErrorDomain.exit();
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
 * @returns {SJSApp}
 * @api private
 */
function _with (description, sailsOpts, msThreshold) {


  var sails = new Sails();

  it('sails loaded (with ' + description + ')', function (done) {
    if (msThreshold) { this.slow(msThreshold); }


    // Expose a new app instance as `this.sails`
    // for other tests to use.
    this.sails = sails;

    // Load the app
    sails.load(sailsOpts || {}, done);
  });

  after(function teardown(done) {
    // Make sure the app is done
    sails.lower(function(){setTimeout(done, 100);});
  });

  return sails;
}


