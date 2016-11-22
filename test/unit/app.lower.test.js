
var assert = require('assert');
var async = require('async');
var Sails = require('../../lib').constructor;

describe('app.lower', function (){

  it('should clean up event listeners', function (done) {

    // Get a list of all the current listeners on the process.
    // Note that Mocha adds some listeners, so these might not all be empty arrays!
    var beforeListeners = {
      sigusr2: process.listeners('SIGUSR2'),
      sigint: process.listeners('SIGINT'),
      sigterm: process.listeners('SIGTERM'),
      exit: process.listeners('exit')
    };

    // Lift and lower 15 Sails apps in a row, to simulate a testing environment
    async.eachSeries(Array(15), function(i, cb) {
      var app = new Sails();
      var options = {
        hooks: {i18n: false},
        globals: false,
        log: {
          level: 'error'
        }
      };

      async.series([
        function(cb) {
          app.load(options, cb);
        },
        app.initialize,
        app.lower
      ], cb);

    }, function(err) {
      if (err) {return done(err);}
      // Check that we have the same # of listeners as before--that is,
      // that all listeners that were added when the apps were initialized
      // were subsequently removed when they were lowered.
      assert.equal(beforeListeners.sigusr2.length,
                   process.listeners('SIGUSR2').length);
      assert.equal(beforeListeners.sigint.length,
                   process.listeners('SIGINT').length);
      assert.equal(beforeListeners.sigterm.length,
                   process.listeners('SIGTERM').length);
      assert.equal(beforeListeners.exit.length,
                   process.listeners('exit').length);
      return done();
    });

  });

});

