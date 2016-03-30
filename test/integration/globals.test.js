/**
 * Test dependencies
 */

var assert = require('assert');
var appHelper = require('./helpers/appHelper');



describe('globals :: ', function() {

  describe('with default settings', function() {

    var sailsApp;
    before(function(done) {
      // Build the app and begin lifting it with default settings.
      appHelper.buildAndLift('testApp', {globals: null}, function(err, sails) {
        if (err) { return done(err); }
        sailsApp = sails;
        return done();
      });
    });




    it('lodash should be globalized', function() {
      assert(typeof _ !== 'undefined');
    });

    it('async should be globalized', function() {
      assert(typeof async !== 'undefined');
    });

    it('sails should be globalized', function() {
      assert(typeof sails !== 'undefined');
    });

    it('services should be globalized', function() {
      assert(typeof TestService !== 'undefined');
    });

    it('models should be globalized', function() {
      assert(typeof User !== 'undefined');
    });




    after(function(done) {
      process.chdir('../');
      appHelper.teardown();
      sailsApp.lower(function(err) {
        if (err) { return done(err); }
        setTimeout(done, 100);
      });
    });


  });


});
