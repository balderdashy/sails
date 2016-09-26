/**
 * Test dependencies
 */

var util = require('util');
var assert = require('assert');
var socketHelper = require('./helpers/socketHelper.js');
var appHelper = require('./helpers/appHelper');
var httpHelper = require('./helpers/httpHelper');


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

    before(function(done) {
      appHelper.build(appName, function(err) {
        if (err) {
          throw new Error(err);
        }
        socketHelper.writeModelConfig();
        appHelper.liftWithTwoSockets({
          silly: false
        }, function(err, sails, _socket1, _socket2) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          socket1 = _socket1;
          socket2 = _socket2;

          httpHelper.testRoute('get', 'user/create?name=joe', function(err) {
            if (err) {
              return done(err);
            }
            httpHelper.testRoute('get', 'user/create?name=abby', function(err) {
              if (err) {
                return done(err);
              }
              done();
            });
          });

        });
      });
    });

    after(function(done) {

      process.chdir('../');
      appHelper.teardown();
      if (sailsprocess) {
        return sailsprocess.lower(function() {
          setTimeout(done, 100);
        });
      }
      return done();
    });

    describe('when a model no default autosubscribe contexts ', function() {

      after(function(done) {
        socket1.disconnect();
        socket2.disconnect();
        done();
      });

      afterEach(function(done) {
        socket1.removeAllListeners();
        socket2.removeAllListeners();
        done();
      });

      it('updating an instance via put should not result in any socket messages being received', function(done) {

        this.slow(3000);
        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });
        socket1.put('/user/1', {
          name: 'scott'
        });
        setTimeout(done, 1000);

      });

      describe('after subscribing to the update context', function() {
        before(function(done) {
          socket2.get('/user/subscribe?id=1&context=update', done);
        });
        it('updating an record via put should result in the correct socket messages being received', function(done) {
          var tookTooLong;
          var triggeredSocketEvent;

          var TIME_TO_WAIT = 1500;
          var timer = setTimeout(function() {
            tookTooLong = true;
            done(new Error('`update` event was not fired in a timely manner (probably was never going to happen.)  Waited ' + TIME_TO_WAIT + 'ms.'));
          }, TIME_TO_WAIT);
          socket2.on('user', function(message) {
            clearTimeout(timer);
            try {
              assert(message.id == 1 && message.verb === 'updated' && message.data.name === 'bob', Err.badResponse(message));
            }
            catch (e) { return done(e); }

            if (tookTooLong) { return; }
            if (triggeredSocketEvent) {
              return done(new Error('Socket event should not fire more than once!'));
            }
            else {
              triggeredSocketEvent = true;
              return done();
            }
          });
          socket1.put('/user/1', {
            name: 'bob'
          });
        });
      });

      it('sending a message should not result in any socket messages being received', function(done) {

        this.slow(3000);
        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });
        socket1.get('/user/message');
        setTimeout(done, 1000);

      });

      describe('after subscribing to the message context', function() {
        before(function(done) {
          socket2.get('/user/subscribe?id=1&context=message', function() {
            done();
          });
        });
        it('sending a message should result in a correct socket messages being received', function(done) {
          socket2.on('user', function(message) {
            assert(message.id == 1 && message.verb == 'messaged' && message.data.greeting == 'hello', Err.badResponse(message));
            done();
          });
          socket1.get('/user/message');
        });
      });

      it('adding a pet to the user should not result in any socket messages being received', function(done) {

        this.slow(3000);
        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });
        socket1.post('/pet', {
          name: 'rex',
          owner: 1
        });
        setTimeout(done, 1000);

      });

      describe('after subscribing to the add:pets context', function() {
        before(function(done) {
          socket2.get('/user/subscribe?id=1&context=add:pets', function() {
            done();
          });
        });
        it('adding a pet should result in a correct socket messages being received', function(done) {
          socket2.on('user', function(message) {
            assert(message.id == 1 && message.verb == 'addedTo' && message.attribute == 'pets' && message.addedId == 2, Err.badResponse(message));
            done();
          });
          socket1.post('/pet', {
            name: 'alice',
            owner: 1
          });
        });
      });

      it('removing a pet from the user should not result in any socket messages being received', function(done) {

        this.slow(3000);
        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });
        socket1.delete('/pet', {
          id: 1
        });
        setTimeout(done, 1000);

      });

      describe('after subscribing to the remove:pets context', function() {
        before(function(done) {
          socket2.get('/user/subscribe?id=1&context=remove:pets', function() {
            done();
          });
        });
        it('removing a pet should result in a correct socket messages being received', function(done) {
          socket2.on('user', function(message) {
            assert(message.id == 1 && message.verb == 'removedFrom' && message.attribute == 'pets' && message.removedId == 2, Err.badResponse(message));
            done();
          });
          socket1.delete('/pet', {
            id: 2
          });
        });
      });

      it('deleting a user should not result in any socket messages being received', function(done) {

        this.slow(3000);
        socket2.on('user', function(message) {
          assert(false, 'User event received by socket 2 when it should not have been!');
        });
        socket1.delete('/user', {
          id: 2
        });
        setTimeout(done, 1000);

      });

      describe('after subscribing to the destroy context', function() {
        before(function(done) {
          socket2.get('/user/subscribe?id=1&context=destroy', function() {
            done();
          });
        });
        it('deleting a user should result in a correct socket messages being received', function(done) {
          socket2.on('user', function(message) {
            assert(message.id == 1 && message.verb == 'destroyed', Err.badResponse(message));
            done();
          });
          socket1.delete('/user', {
            id: 1
          });
        });
      });
    });

  });
});
