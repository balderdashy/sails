/**
 * Test dependencies
 */
var assert = require('assert');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');

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

  var sailsprocess;
  var socket1;
  var socket2;
  var appName = 'testApp';

  describe('Model events', function() {


    describe('when a socket is watching Users ', function() {

      before(function(done) {
        this.timeout(10000);
        appHelper.buildAndLiftWithTwoSockets(appName, {silly: false /*, sockets: {'backwardsCompatibilityFor0.9SocketClients':false} */}, function(err, sails, _socket1, _socket2) {
          if (err) {throw new Error(err);}
          sailsprocess = sails;
          socket1 = _socket1;
          socket2 = _socket2;
          socket2.get('/user/watch', function(){done();});
        });
      });

      after(function(done) {

        socket1.disconnect();
        socket2.disconnect();

        // Add a delay before killing the app to account for any queries that
        // haven't been run by the blueprints yet; otherwise they might casue an error
        setTimeout(function() {
          sailsprocess.kill();
          process.chdir('../');
          appHelper.teardown();
          done();
        }, 500);

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
        socket1.post('/user', {name:'scott'});

      });

      it('hitting the custom /userMessage route should result in a correct `user` event being received by all subscribers', function(done) {
        socket2.on('user', function(message) {
          assert(message.id === 1 && message.verb == 'messaged' && message.data.greeting == 'hello', Err.badResponse(message));
          done();
        });
        socket1.get('/user/message', function(){ });

      });

      it('updating the user via PUT /user/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1 && message.verb == 'updated' && message.data.name == 'joe' && message.previous.name == 'scott', Err.badResponse(message));
          done();
        });

        socket1.put('/user/1', {name:'joe'});

      });

      it ('adding a pet to the user via POST /pet should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1
            && message.verb == 'addedTo'
            && message.attribute == 'pets'
            && message.addedId == 1, Err.badResponse(message));
          done();
        });

        socket1.post('/pet', {name:'rex', owner: 1});

      });

      it ('adding a profile to the user via POST /userprofile should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1
            && message.verb == 'updated'
            && message.data.profile == 1, Err.badResponse(message));
          done();
        });

        socket1.post('/userprofile', {user:1, zodiac: 'taurus'});

      });

      it ('removing a pet from the user via PUT /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1
            && message.verb == 'removedFrom'
            && message.attribute == 'pets'
            && message.removedId == 1, Err.badResponse(message));
          done();
        });

        socket1.put('/pet/1', {owner: null});

      });

      it ('changing a profile\'s user via PUT /userprofile/1 should result in two correct `user` events being received by all subscribers', function(done) {

        // Create a new user to attach the profile to
        socket1.post('/user', {name: 'Sandy'}, function() {

          var msgsReceived = 0;
          // We should receive two 'user' updates: one from user #1 telling us they no longer have a profile, one
          // from user #2 telling us they are now attached to profile #1
          socket2.on('user', function(message) {
            // Ignore the "create" message if we happen to get it
            if (message.verb == 'created' && message.data.name == 'Sandy') {return;}
            assert(
              (message.id == 1 && message.verb == 'updated' && message.data.profile == null)
              || (message.id == 2 && message.verb == 'updated' && message.data.profile == 1)
            , Err.badResponse(message));
            msgsReceived++;
            if (msgsReceived == 2) {done();}
          });

          socket1.put('/userprofile/1', {user: 2});

        });


      });

      it ('adding a pet from the user via PUT /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1
            && message.verb == 'addedTo'
            && message.attribute == 'pets'
            && message.addedId == 1, Err.badResponse(message));
          done();
        });

        socket1.put('/pet/1', {owner: 1});

      });


      // TODO: make this test work without relying on previous tests.
      // (i.e. bootstrap some data in a `before()`)
      it ('removing the user from the pet via DELETE /user/1/pets should result a correct `pet` event being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {
          assert(message.id == 1
            && message.verb == 'updated'
            && message.data.owner == null
            , Err.badResponse(message));
          done();
        })

        // Avoiding this case temporarily:
        // socket2.delete('/user/1/pets', {pet_id:1});

        // Instead, use:
        socket2.delete('/user/1/pets/1', {}, function (body, jwr) {
          // TODO:
          // when new sails.io.js client is being used in tests,
          // ensure that a valid response came back from the server here.
        });

      });

      it ('removing a profile from the user via DELETE /userprofile/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 2
            && message.verb == 'updated'
            && message.data.profile == null, Err.badResponse(message));
          done();
        })

        socket1.delete('/userprofile/1');

      });


      it ('adding a user to the pet via POST /user/1/pets should result in a correct `pet` event being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {
          assert(message.id == 1
            && message.verb == 'updated'
            && message.data.owner == 1
            , Err.badResponse(message));
          done();
        })

        socket2.post('/user/1/pets', {pet_id:1});

      });

      it ('removing a pet from the user via DELETE /pet/1 should result a correct `user` event being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          assert(message.id == 1
            && message.verb == 'removedFrom'
            && message.attribute == 'pets'
            && message.removedId == 1, Err.badResponse(message));
          done();
        })

        socket1.delete('/pet/1');

      });

      it ('creating a new pet and adding it via POST /user/1/pets should result in a `pet` event and a `user` event being received by all subscribers', function(done) {

        var msgsReceived = 0;
        // We should receive two 'user' updates: one from user #1 telling us they no longer have a profile, one
        // from user #2 telling us they are now attached to profile #1
        socket1.on('pet', function(message) {
          assert(
            (message.id === 2 && message.verb == 'created' && message.data.name == 'alice')
          , Err.badResponse(message));
          msgsReceived++;
          if (msgsReceived == 2) {done();}
        });

        socket1.on('user', function(message) {
          assert(message.id === 1 && message.verb == 'addedTo' && message.attribute == 'pets' && message.addedId == 2, Err.badResponse(message));
          msgsReceived++;
          if (msgsReceived == 2) {done();}
        });


        socket1.get('/pet/watch', function() {
          socket2.post('/user/1/pets', {name:'alice'});
        });

      });

    });

  });
});
