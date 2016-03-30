/**
 * Module dependencies
 */

var assert = require('assert');
var _ = require('lodash');
var async = require('async');
var Sails = require('../../../lib').Sails;
var socketIOClient = require('socket.io-client');
var sailsIOClient = require('../../helpers/sails.io.js');


describe('Pubsub hook', function (){

  describe('publishCreate()', function (){

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
        // Provide the app w/ a model
        orm: {
          moduleDefinitions: {
            models: {
              pet: {
                attributes: {
                  name: {type: 'string'}
                }
              }
            }
          }
        },
        routes: {
          'POST /pet': function (req, res){
            // (notice we're not actually doing anything to the database-
            //  this is just testing publishCreate)
            try {
              app.models.pet.publishCreate({id: 1, randomData: 'helloWorld!'});
            } catch (e) {
              return res.json(500, {error: e.message});
            }
            return res.send();
          },
          'GET /watch': function (req, res) {
            app.models.pet.watch(req);
            return res.send();
          }
        }
      }, function (err){
        if (err) return done(err);
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

    // Use the endpoints defined above to subscribe sockets to the Pet class room
    before(function (done){
      async.each(_.keys(clientSocks), function (key, next){
        clientSocks[key].get('/watch', function(body, jwr) {
          if (jwr.error) return next(err);
          next();
        });
      }, done);
    });


    // All sockets listen for `pet` events
    before(function (){
      _.each(clientSocks, function (socket, key) {
        socket.on('pet', function (event){
          socket._receivedPetEvents = socket._receivedPetEvents || [];
          socket._receivedPetEvents.push(event);
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
      app.lower(function(){setTimeout(done, 100);});
    });



    // Test suite
    ////////////////////////////////////////////////////////////////////////////////
    describe('invoked with the id of the new record and some random data', function (){

      // Lenny triggers publishCreate with a new pet
      before(function (done){
        clientSocks.lenny.post('/pet', {
          name: 'socks'
        }, function (body, jwr){
          if (jwr.error) return done(jwr.error);
          return done();
        });
      });

      it('should notify all client sockets watching the model class', function (){
        _.each(clientSocks, function (socket, key) {
          assert.equal(socket._receivedPetEvents.length, 1);
          assert.equal(socket._receivedPetEvents[0].verb, 'created');
          assert.equal(socket._receivedPetEvents[0].id, 1);
        });
      });
    });

  });
});

