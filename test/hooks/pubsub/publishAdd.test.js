/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('lodash');
var async = require('async');
var Sails = require('../../../lib').Sails;
var socketIOClient = require('socket.io-client');
var sailsIOClient = require('../../helpers/sails.io.js');


describe('Pubsub hook', function (){

  describe('publishAdd()', function (){

    var app = Sails();

    // Setup
    ////////////////////////////////////////////////////////////////////////////////

    // Lift the app
    before(function (done){
      app.lift({
        globals: false,
        port: 1535,
        models: { migrate: 'safe' },
        log: {level: 'silent'},
        loadHooks: ['moduleloader','userconfig','orm', 'http', 'sockets', 'pubsub'],
        routes: {
          'PUT /dock/:id/subscribe': function (req, res){
            app.models.dock.subscribe(req, req.param('id'));
            return res.send();
          },
          'POST /dock/:id/addVessel': function (req, res){
            // (notice we're not actually doing anything to the database-
            //  this is just testing publishAdd)
            app.models.dock.publishAdd(req.param('id'), 'vessels', req.param('vessel'));
            return res.send();
          }
        },
        // Provide the app w/ a couple of models
        orm: {
          moduleDefinitions: {
            models: {
              vessel: {
                attributes: {
                  name: {type: 'string'},
                  dockedAt: {model: 'Dock'}
                }
              },
              dock: {
                attributes: {
                  location: {type: 'string'},
                  vessels: {collection:'Vessel', via: 'dockedAt'}
                }
              }
            }
          }
        }
      }, function (err){
        if (err) { return done(err); }
        return done();
      });
    });

    // Build sails.io client instance and connect some client socks
    var clientSocks = {
      leonora: undefined,
      lenny: undefined,
      larry: undefined,
      langerie: undefined
    };
    before(function (done){
      var io = sailsIOClient(socketIOClient);
      io.sails.autoConnect = false;
      io.sails.environment = 'production'; // (to disable logs from sails.io client)
      io.sails.url = 'http://localhost:1535';
      async.each(_.keys(clientSocks), function (key, next){
        clientSocks[key] = io.sails.connect();
        clientSocks[key].on('connect', function (){
          next();
        });
      }, done);
    });

    // Use the endpoints defined above to subscribe sockets to a Dock record with id=1.
    before(function (done){
      async.each(_.keys(clientSocks), function (key, next){
        clientSocks[key].put('/dock/1/subscribe', function(body, jwr) {
          if (jwr.error) {
            return next(new Error('Error received on jwr.  JWR:'+util.inspect(jwr, {depth: null}) ));
          }
          return next();
        });
      }, done);
    });


    // All sockets listen for `dock` events
    before(function (){
      _.each(clientSocks, function (socket, key) {
        socket.on('dock', function (event){
          socket._receivedDockEvents = socket._receivedDockEvents || [];
          socket._receivedDockEvents.push(event);
        });
      });
    });



    // Teardown
    ////////////////////////////////////////////////////////////////////////////////

    // Disconnect the sockets
    after(function (){
      clientSocks.leonora.disconnect();
      clientSocks.larry.disconnect();
      clientSocks.lenny.disconnect();
      clientSocks.langerie.disconnect();
    });

    // Shut down the app
    after(function (done){
      app.lower(done);

      // If we ever find ourselves needing this again, we can bring it back:
      // app.lower(function(){setTimeout(done, 100);});
    });



    // Test suite
    ////////////////////////////////////////////////////////////////////////////////
    describe('invoked with the id of the child record', function (){

      // Lenny triggers publishAdd with a vessel id
      before(function (done){
        clientSocks.lenny.post('/dock/1/addVessel', {
          vessel: 47
        }, function (body, jwr){
          if (jwr.error) { return done(jwr.error); }
          return done();
        });
      });

      it('should notify all client sockets subscribed to parent record', function (){
        _.each(clientSocks, function (socket, key) {
          assert.equal(socket._receivedDockEvents.length, 1);
          assert.equal(socket._receivedDockEvents[0].verb, 'addedTo');
          assert.equal(socket._receivedDockEvents[0].id, 1);
          assert.equal(socket._receivedDockEvents[0].addedId, 47);
        });
      });
    });

    describe('invoked with an object representing the child record', function (){

      // Lenny triggers publishAdd with an entire vessel object
      before(function (done){
        clientSocks.lenny.post('/dock/1/addVessel', {
          vessel: {
            id: 52,
            name: 'The Silver Goose'
          }
        }, function (body, jwr){
          if (jwr.error) { return done(jwr.error); }
          return done();
        });
      });

      it('should notify client sockets subscribed to parent record', function (){
        _.each(clientSocks, function (socket, key) {
          assert.equal(socket._receivedDockEvents.length, 2);
          assert.equal(socket._receivedDockEvents[1].verb, 'addedTo');
          assert.equal(socket._receivedDockEvents[1].id, 1);
          assert.equal(socket._receivedDockEvents[1].addedId, 52);
          assert.equal(socket._receivedDockEvents[1].added.id, 52);
          assert.equal(socket._receivedDockEvents[1].added.name, 'The Silver Goose');
        });
      });
    });

    describe('invoked with an object representing the child record, but missing the primary key value', function (){

      // Larry triggers publishAdd with a vessel object with no PK value
      before(function (done){
        clientSocks.larry.post('/dock/1/addVessel', {
          vessel: {
            name: 'The Silver Goose'
          }
        }, function (body, jwr){
          if (jwr.error) { return done(jwr.error); }
          //
          // NOTE:
          // publishAdd does not currently throw an error, in keeping with
          // the approach taken by the other methods there.
          //
          // This could be changed in the future.
          //
          return done();
        });
      });

      it('should NOT notify any of the client sockets subscribed to parent record', function (){
        _.each(clientSocks, function (socket, key) {
          assert.equal(socket._receivedDockEvents.length, 2);
        });
      });
    });

  });
});

