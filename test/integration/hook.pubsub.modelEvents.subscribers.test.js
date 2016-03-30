/**
 * Test dependencies
 */

var util = require('util');
var _ = require('lodash');
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


/**
 * NOTE:
 * These tests connect to the Sails server using the traditional v0.9.x-style
 * connection.  They don't specify a version string when initiating the socket.io
 * connection, so they are automatically downgraded to the legacy usage.
 *
 * Fortunately, this provides a great test suite to ensure consistent support.
 */

describe('pubsub :: ', function() {

  describe('Model events', function() {

    describe('when a socket is watching Users ', function() {
      var socket1;
      var socket2;
      var appName = 'testApp';
      var sailsApp;

      before(function(done) {
        appHelper.buildAndLiftWithTwoSockets(appName, {
          log: {level: 'silent'}, /*, sockets: {'backwardsCompatibilityFor0.9SocketClients':false} */
        }, function(err, sails, _socket1, _socket2) {
          if (err) {
            return done(err);
          }
          sailsApp = sails;
          socket1 = _socket1;
          socket2 = _socket2;
          socket2.get('/user/watch', function(body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            done();
          });
        });
      });

      afterEach(function(done) {
        socket1.removeAllListeners();
        socket2.removeAllListeners();
        done();
      });

      it('a post request to /user should result in the socket watching User getting a `user` event', function(done) {

        socket2.on('user', function(message) {
          assert(message.id === 1 && message.verb == 'created' && message.data.name == 'scott', Err.badResponse(message));
          done();
        });
        socket1.post('/user', {
          name: 'scott'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('hitting the custom /userMessage route should result in a correct `user` event being received by all subscribers', function(done) {
        socket2.on('user', function(message) {
          assert(message.id === 1 && message.verb == 'messaged' && message.data.greeting == 'hello', Err.badResponse(message));
          done();
        });
        socket1.get('/user/message', function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('updating the user via PUT /user/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 && message.verb == 'updated' && message.data.name == 'joe' && message.previous.name == 'scott', Err.badResponse(message));
          done();
        });

        socket1.put('/user/1', {
          name: 'joe'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('adding a pet to the user via POST /pet should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 &&
            message.verb == 'addedTo' &&
            message.attribute == 'pets' &&
            message.addedId == 1, Err.badResponse(message));
          done();
        });

        socket1.post('/pet', {
          name: 'rex',
          owner: 1
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('removing a pet from the user via PUT /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 &&
            message.verb == 'removedFrom' &&
            message.attribute == 'pets' &&
            message.removedId == 1, Err.badResponse(message));
          done();
        });

        socket1.put('/pet/1', {
          owner: null
        }, function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

    it('adding a pet from the user via PUT /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 &&
            message.verb == 'addedTo' &&
            message.attribute == 'pets' &&
            message.addedId == 1, Err.badResponse(message));
          done();
        });

        socket1.put('/pet/1', {
          owner: 1
        }, function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });


      // TODO: make this test work without relying on previous tests.
      // (i.e. bootstrap some data in a `before()`)
      it('removing the user from the pet via DELETE /user/1/pets/1 should result a correct `pet` event being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {
          try {
            assert(+message.id === 1 && message.verb === 'updated' && _.isNull(message.data.owner), Err.badResponse(message));
          }
          catch (e) { return done(e); }
          done();
        });

        socket2.delete('/user/1/pets/1', {}, function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('adding a user to the pet via POST /user/1/pets should result in a correct `pet` event being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {
          assert(message.id == 1 &&
            message.verb == 'updated' &&
            message.data.owner == 1, Err.badResponse(message));
          done();
        });

        socket2.post('/user/1/pets', {
          pet_id: 1
        },function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('removing a pet from the user via DELETE /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 &&
            message.verb == 'removedFrom' &&
            message.attribute == 'pets' &&
            message.removedId == 1, Err.badResponse(message));
          done();
        });

        socket1.delete('/pet/1', function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('creating a new pet and adding it via POST /user/1/pets should result in a `pet` event and a `user` event being received by all subscribers', function(done) {

        var msgsReceived = 0;
        // We should receive two 'user' updates: one from user #1 telling us they no longer have a profile, one
        // from user #2 telling us they are now attached to profile #1
        socket1.on('pet', function(message) {
          assert(
            (message.id === 2 && message.verb == 'created' && message.data.name == 'alice'), Err.badResponse(message));
          msgsReceived++;
          if (msgsReceived == 2) {
            return done();
          }
          if (msgsReceived > 2) {
            throw new Error('Extra, unexpected socket message received in test!');
          }
        });

        socket1.on('user', function(message) {
          assert(message.id === 1 && message.verb == 'addedTo' && message.attribute == 'pets' && message.addedId == 2, Err.badResponse(message));
          msgsReceived++;
          if (msgsReceived == 2) {
            return done();
          }
          if (msgsReceived > 2) {
            throw new Error('Extra, unexpected socket message received in test!');
          }
        });


        socket1.get('/pet/watch', function() {
          socket2.post('/user/1/pets', {
            name: 'alice'
          },function(body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });
        },function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('updating the user again via PUT /user/1 should result in a correct `user` event being received by all subscribers, with previous pets populated', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 && message.verb == 'updated' && message.data.name == 'ron' && message.previous.name == 'joe' && message.previous.pets.length == 1, Err.badResponse(message));
          done();
        });

        socket1.put('/user/1', {
          name: 'ron'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('updating the user again via PUT /user/1 with "populate=false" should result in a correct `user` event being received by all subscribers, with no previous pets populated', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 && message.verb == 'updated' && message.data.name == 'larry' && message.previous.name == 'ron' && !message.previous.pets, Err.badResponse(message));
          done();
        });

        socket1.put('/user/1?populate=false', {
          name: 'larry'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('destroying a user via DELETE /user/1 should result in a `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 && message.verb == 'destroyed', Err.badResponse(message));
          return done();
        });


        socket1.delete('/user/1', function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });


      after(function(done) {

        socket1.disconnect();
        socket2.disconnect();

        // Add a delay before killing the app to account for any queries that
        // haven't been run by the blueprints yet; otherwise they might casue an error
        setTimeout(function() {
          process.chdir('../');
          appHelper.teardown();
          sailsApp.lower(done);
        }, 500);

      });

    });
  });
});
