/**
 * Test dependencies
 */

var util = require('util');
var assert = require('assert');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');



describe('hook:sockets :: ', function() {

  var sailsApp;
  var socket1;
  var socket2;
  var appName = 'testApp';

  describe('interpreter', function() {

    before(function(done) {
      appHelper.buildAndLiftWithTwoSockets(appName, {
        silly: false
      }, function(err, sails, _socket1, _socket2) {
        if (err) { return done(err); }

        if (!_socket1 || !_socket2) {
          return done(new Error('Failed to connect test sockets'));
        }
        sailsApp = sails;
        socket1 = _socket1;
        socket2 = _socket2;
        done();
      });
    });

    after(function(done) {
      socket1.disconnect();
      socket2.disconnect();
      process.chdir('../');
      appHelper.teardown();

      sailsApp.lower(done);
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
