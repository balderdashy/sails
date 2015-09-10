/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');

describe('globals :: ', function() {

  describe('with default settings', function() {

    var sailsprocess;
    var appName = 'testApp';

    before(function(done) {
      this.timeout(15000);
      // Build the app
      appHelper.buildAndLift(appName, {globals: null}, function(err, sails) {

        sailsprocess = sails;
        return done(err);

      });


    });

    after(function() {

      sailsprocess.kill();
      // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
      process.chdir('../');
      // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
      appHelper.teardown();
    });

    it('lodash should be globalized', function() {
      assert(_);
      assert.equal(_.name, 'lodash');
    });

    it('async should be globalized', function() {
      assert(async);
    });

    it('sails should be globalized', function() {
      assert(sails);
    });

    it('services should be globalized', function() {
      assert(TestService);
    });

    it('models should be globalized', function() {
      assert(User);
    });


  });


});
