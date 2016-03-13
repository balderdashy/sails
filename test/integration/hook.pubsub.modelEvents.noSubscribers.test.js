/**
 * Test dependencies
 */
var util = require('util');
var assert = require('assert');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');



/**
 * Errors
 */
var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response);
  }
};




describe('pubsub :: ', function() {

  var sailsprocess;
  var socket1;
  var socket2;
  var appName = 'testApp';

  describe('Model events', function() {

    describe('when no one is subscribed to user #1 and User has no watchers ', function() {

      before(function(done) {
        appHelper.buildAndLiftWithTwoSockets(appName, function(err, sails, _socket1, _socket2) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
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
        if (sailsprocess) {
          return sailsprocess.lower(function() {
            setTimeout(done, 100);
          });
        }
        return done();
      });

      this.slow(3000);

      afterEach(function(done) {
        socket2.removeAllListeners();
        done();
      });

      it('a post request to /user should result in no `user` events being received', function(done) {

        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });
        socket1.post('/user', {
          name: 'scott'
        });
        setTimeout(done, 1000);

      });

      it('updating the user via PUT /user/1 should result in no `user` events being received', function(done) {

        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });

        socket1.put('/user/1', {
          name: 'joe'
        });
        setTimeout(done, 1000);

      });

      it('adding a pet to the user via POST /pet should result in no `user` events being received', function(done) {

        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });

        socket1.post('/pet', {
          name: 'rex',
          owner: 1
        });
        setTimeout(done, 1000);

      });

      it('removing a pet from the user via DELETE /pet/1 should result in no `user` events being received', function(done) {

        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });

        socket1.delete('/pet/1');
        setTimeout(done, 1000);

      });

      it('deleting the user via DELETE /user/1 should result in no `user` events being received', function(done) {

        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });

        socket1.delete('/user/1');
        setTimeout(done, 1000);

      });

    });

  });
});
