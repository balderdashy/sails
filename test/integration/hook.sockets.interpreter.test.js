/**
 * Test dependencies
 */

var assert = require('assert');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');



describe('hook:sockets :: ', function() {

  var sailsprocess;
  var socket1;
  var socket2;
  var appName = 'testApp';

  describe('interpreter', function() {

    before(function(done) {
      this.timeout(10000);
      appHelper.buildAndLiftWithTwoSockets(appName, {
        silly: false
      }, function(err, sails, _socket1, _socket2) {
        if (err) return done(err);

        if (!_socket1 || !_socket2) {
          return done(new Error('Failed to connect test sockets'));
        }
        sailsprocess = sails;
        socket1 = _socket1;
        socket2 = _socket2;
        done();
      });
    });

    after(function() {
      socket1.disconnect();
      socket2.disconnect();
      if (sailsprocess) {
        sailsprocess.kill();
      }
      process.chdir('../');
      appHelper.teardown();
    });

    afterEach(function(done) {
      socket1.removeAllListeners();
      socket2.removeAllListeners();
      done();
    });

    describe('basic usage', function() {

      it('should probably be tested using a different helper...');
      // TODO: use new sails.io.js client to perform these tests
      // see http://github.com/balderdashy/sails.io.js
    });

  });
});
