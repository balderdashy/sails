
var assert = require('assert');
var async = require('async');
var Sails = require('../../lib').constructor;

describe('app.lower', function (){

  it('should clean up event listeners', function (done) {

    var beforeListeners = {
      sigusr2: process.listeners('SIGUSR2'),
      sigint: process.listeners('SIGINT'),
      sigterm: process.listeners('SIGTERM'),
      exit: process.listeners('exit')
    };

    var app = new Sails();
    var options = {
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
    ], function (err) {
      assert.equal(beforeListeners.sigusr2.length,
                   process.listeners('SIGUSR2').length);
      assert.equal(beforeListeners.sigint.length,
                   process.listeners('SIGINT').length);
      assert.equal(beforeListeners.sigterm.length,
                   process.listeners('SIGTERM').length);
      assert.equal(beforeListeners.exit.length,
                   process.listeners('exit').length);
      done(err);
    });

  });

});

