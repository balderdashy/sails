/**
 * Test dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var assert = require('assert');
var async = require('async');
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

  describe('Model events', function() {

    describe('when a socket is watching Users ', function() {
      var socket1;
      var socket2;
      var appName = 'testApp';
      var sailsApp;

      before(function (done) {
        appHelper.buildAndLiftWithTwoSockets(appName, {
          log: {level: 'warn'}, /*, sockets: {'backwardsCompatibilityFor0.9SocketClients':false} */
        }, function(err, sails, _socket1, _socket2) {
          if (err) {
            return done(err);
          }
          sailsApp = sails;
          socket1 = _socket1;
          socket2 = _socket2;
          // Subscribe to new user notifications.
          socket2.get('/user', function(body, jwr) {
            if (jwr.error) { return done(new Error('Error in tests.  Details:' + JSON.stringify(jwr))); }
            done();
          });
        });
      });

      afterEach(function(done) {
        socket1.removeAllListeners();
        socket2.removeAllListeners();
        done();
      });

      it('a post request to /user should result in the socket watching User getting a `user` event w/ verb `created`', function(done) {

        socket2.on('user', function(message) {
          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'created');
            assert.strictEqual(message.data.name, 'scott');
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

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
          try {
            assert.strictEqual(message.greeting, 'hello', Err.badResponse(message));
          } catch (e) { return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack)); }
          done();
        });
        socket1.get('/user/message', function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('updating the user via PUT /user/1 should result a correct `user` event w/ verb `updated` being received by all subscribers', function(done) {

        socket2.on('user', function(message) {

          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'updated');
            assert.strictEqual(message.data.name, 'joe');
            assert.strictEqual(message.previous.name, 'scott');
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

          // IWMIH, it looks good.
          return done();

        });

        socket1.put('/user/1', {
          name: 'joe'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('adding a pet to the user via POST /pet should result a correct `user` event w/ verb `addedTo` being received by all subscribers', function(done) {

        socket2.on('user', function(message) {

          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'addedTo');
            assert.strictEqual(message.attribute, 'pets');
            assert.strictEqual(message.addedId, 1);
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

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

      it('removing a pet from the user via PUT /pet/1 should result a correct `user` event w/ verb `removedFrom` being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'removedFrom');
            assert.strictEqual(message.attribute, 'pets');
            assert.strictEqual(message.removedId, 1);
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

          done();
        });

        socket1.put('/pet/1', {
          owner: null
        }, function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('adding a pet from the user via PUT /pet/1 should result a correct `user` event w/ verb `addedTo` being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'addedTo');
            assert.strictEqual(message.attribute, 'pets');
            assert.strictEqual(message.addedId, 1);
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

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
      it('removing the user from the pet via DELETE /user/1/pets/1 should result a correct `pet` event w/ verb `updated` being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {
          try {
            assert(message.id === 1 && message.verb === 'updated' && _.isNull(message.data.owner), Err.badResponse(message));
          } catch (e) { return done(e); }

          done();
        });

        socket2.delete('/user/1/pets/1', {}, function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('adding a user to the pet via PUT /user/1/pets/1 should result in a correct `pet` event w/ verb `updated` being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {

          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'updated');
            assert.strictEqual(message.data.owner, 1);
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

          done();
        });

        socket2.put('/user/1/pets/1', {}, function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('removing a pet from the user via DELETE /pet/1 should result a correct `user` event w/ verb `removedFrom` being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          try {
            assert.strictEqual(message.id, 1);
            assert.strictEqual(message.verb, 'removedFrom');
            assert.strictEqual(message.attribute, 'pets');
            assert.strictEqual(message.removedId, 1);
          } catch (e) {
            return done(new Error('Consistency violation: '+(Err.badResponse(message)).message+'\nDetails:\n'+e.stack));
          }

          done();
        });

        socket1.delete('/pet/1', function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('creating a new pet and adding it via POST /pet should result in a `pet` event w/ verb `created` and a `user` event w/ verb `addedTo` being received by all subscribers', function(done) {

        async.auto({
          petMessage: function(cb) {
            socket1.on('pet', function(message) {
              try {
                assert((message.id === 2 && message.verb === 'created' && message.data.name === 'alice'), Err.badResponse(message));
                return cb();
              } catch (e) { return cb(e); }
            });
          },
          userMessage: function(cb) {
            socket1.on('user', function(message) {
              try {
                assert(message.id === 1 && message.verb === 'addedTo' && message.attribute === 'pets' && message.addedId === 2, Err.badResponse(message));
                return cb();
              } catch (e) { return cb(e); }
            });
          }
        }, done);

        // Subscribe to new pet notifications.
        socket1.get('/pet', function() {
          socket2.post('/pet', {
            name: 'alice',
            owner: 1
          },function(body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });
        },function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('creating a new user via POST /user with an array value for a collection attribute should result in a correct `pet` event w/ verb `addedTo` being received by all subscribers', function(done) {

        socket1.on('pet', function(message) {
          try {
            assert((message.id === 2 && message.verb === 'addedTo' && message.attribute === 'vets' && message.addedId === 2), Err.badResponse(message));
            return done();
          } catch (e) { return done(e); }
        });

        // Subscribe to new pet notifications.
        socket1.get('/pet', function() {
          socket2.post('/user', {
            name: 'roger',
            patients: [2]
          },function(body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });
        },function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('adding a pet to a user via PUT /user/2/pets, where the pet already has an owner, should result in a correct `user` event w/ verb `removedFrom` being received by all subscribers to the former owner', function(done) {

        var userEvents = {
          addedTo: false,
          removedFrom: false
        };
        socket1.on('user', function(message) {
          if (message.id === 1 && message.verb === 'removedFrom' && message.attribute === 'pets' && message.removedId === 2) {
            if (userEvents.removedFrom) {
              return done(new Error('Got a duplicate `removedFrom` message'));
            }
            userEvents.removedFrom = true;
          }
          else if (message.id === 2 && message.verb === 'addedTo' && message.attribute === 'pets' && message.addedId === 2) {
            if (userEvents.addedTo) {
              return done(new Error('Got a duplicate `addedTo` message'));
            }
            userEvents.addedTo = true;
          }
          else {
            return done(new Error('Bad message received: ' + Err.badResponse(message)));
          }

          if (userEvents.addedTo && userEvents.removedFrom) {
            return done();
          }
        });

        // Subscribe to new pet notifications.
        socket1.get('/user', function() {
          socket2.put('/user/2/pets/2', {},function(body, jwr) {
            if (jwr.error) { return done(jwr.error); }
            // Otherwise, the event handler above should fire (or this test will time out and fail).
          });
        },function(body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });


      });

      it('updating the user again via PUT /user/1 should result in a correct `user` event with verb `updated` being received by all subscribers, with previous pets populated', function(done) {

        socket2.on('user', function(message) {
          try {
            assert(message.id === 1 && message.verb === 'updated' && message.data.name === 'ron' && message.previous.name === 'joe' && message.previous.pets.length === 0, Err.badResponse(message));
          } catch (e) { return done(e); }
          done();
        });

        socket1.put('/user/1', {
          name: 'ron'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('updating the user again via PUT /user/1 with "populate=false" should result in a correct `user` event w/ verb `updated` being received by all subscribers, with no previous pets populated', function(done) {

        socket2.on('user', function(message) {
          try {
            assert(message.id === 1 && message.verb === 'updated' && message.data.name === 'larry' && message.previous.name === 'ron' && !message.previous.pets, Err.badResponse(message));
          } catch (e) { return done(e); }
          done();
        });

        socket1.put('/user/1?populate=false', {
          name: 'larry'
        }, function (body, jwr) {
          if (jwr.error) { return done(jwr.error); }
          // Otherwise, the event handler above should fire (or this test will time out and fail).
        });

      });

      it('destroying a user via DELETE /user/1 should result in a `user` event w/ verb `destroyed` being received by all subscribers', function(done) {

        socket2.on('user', function(message) {
          try {
            assert(message.id === 1 && message.verb === 'destroyed', Err.badResponse(message));
          } catch (e) { return done(e); }
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

      });//</after>

    });//</describe>
  });//</describe :: Model events>
});//</describe :: pubsub>
