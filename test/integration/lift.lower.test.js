var assert = require('assert');
var Sails = require('../../lib/app');
var async = require('async');

describe('sails being lifted and lowered (e.g in a test framework)', function() {

  it('should clean up event listeners', function(done) {

    // Get a list of all the current listeners on the process.
    // Note that Mocha adds some listeners, so these might not all be empty arrays!
    var beforeListeners = {
      sigusr2: process.listeners('SIGUSR2'),
      sigint: process.listeners('SIGINT'),
      sigterm: process.listeners('SIGTERM'),
      exit: process.listeners('exit')
    };

    // Lift and lower 15 Sails apps in a row, to simulate a testing environment
    async.forEachOfSeries(Array(15), function(undef, i, cb) {
      var sailsServer = null;
      Sails().lift({
        port: 1342,
        environment: process.env.TEST_ENV,
        log: {
          level: 'error'
        },
        globals: false,
        hooks: {
          grunt: false,
        }
      }, function(err, sails) {
        if (err) {
          return cb(err);
        }
        setTimeout(function() {
          sails.lower(function(){setTimeout(cb, 100);});
        });

      });

    }, function(err) {
      if (err) {
        return done(err);
      }
      // Check that we have the same # of listeners as before--that is,
      // that all listeners that were added when the apps were initialized
      // were subsequently removed when they were lowered.
      assert.equal(beforeListeners.sigusr2.length,
        process.listeners('SIGUSR2').length);
      assert.equal(beforeListeners.sigterm.length,
        process.listeners('SIGTERM').length);
      assert.equal(beforeListeners.exit.length,
        process.listeners('exit').length);
      assert.equal(beforeListeners.sigint.length,
        process.listeners('SIGINT').length);
      return done();
    });

  }); //</should clean up event listeners>







  it('should revert NODE_ENV env variable if it was set automatically on load/lift', function(done) {

    // Save reference to original NODE_ENV.
    var originalNodeEnv = process.env.NODE_ENV;

    // Load `app0` deep in the `'cenote'`
    Sails().load({
      environment: 'cenote',
      log: {
        level: 'error'
      },
      globals: false,
      hooks: {
        grunt: false,
      }
    }, function(err, app0) {
      if (err) { return done(err); }

      // Assert that NODE_ENV was set automatically.
      assert.equal('cenote', process.env.NODE_ENV);

      // Lower `app0`
      app0.lower(function (){

        // Assert that NODE_ENV has been reverted.
        assert.equal(originalNodeEnv, process.env.NODE_ENV);

        // Load `app1` in the `'savanna'`
        Sails().load({
          environment: 'savanna',
          log: {
            level: 'error'
          },
          globals: false,
          hooks: {
            grunt: false,
          }
        }, function(err, app1) {
          if (err) { return done(err); }

          // Assert that NODE_ENV was set automatically.
          assert.equal('savanna', process.env.NODE_ENV);

          // Lower `app1`
          app1.lower(function (){

            // Assert that NODE_ENV has been reverted again.
            assert.equal(originalNodeEnv, process.env.NODE_ENV);

            return done();
          });//</app1.lower()>
        });//</app1.load()>
      });//</app0.lower()>
    });//</app0.load()>

  });



});
