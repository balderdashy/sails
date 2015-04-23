/**
 * Module dependencies
 */

var Sails = require('../../../lib').Sails;


describe('Pubsub hook', function (){
  describe('loading a Sails app', function (){

    describe('without ORM hook', function (){
      var app = Sails();
      it('should fail', function (done){
        app.load({
          globals: false,
          log: {level: 'silent'},
          loadHooks: ['moduleloader','userconfig','pubsub']
        }, function (err){
          if (err) return done();
          return done(new Error('Should have failed to load the pubsub hook w/o the `orm` hook.'));
        });
      });
    });

    describe('without sockets hook', function (){
      var app = Sails();
      it('should fail', function (done){
        app.load({
          globals: false,
          log: {level: 'silent'},
          loadHooks: ['moduleloader','userconfig','orm', 'pubsub']
        }, function (err){
          if (err) return done();
          return done(new Error('Should have failed to load the pubsub hook w/o the `sockets` hook.'));
        });
      });
    });

    describe('without http hook', function (){
      var app = Sails();
      it('should fail', function (done){
        app.load({
          globals: false,
          log: {level: 'silent'},
          loadHooks: ['moduleloader','userconfig','orm', 'sockets', 'pubsub']
        }, function (err){
          if (err) return done();
          return done(new Error('Should have failed to load the pubsub hook w/o the `http` hook.'));
        });
      });
    });

    describe('with `orm` and `sockets` hooks', function (){
      var app = Sails();
      it('should load successfully', function (done){
        app.load({
          globals: false,
          log: {level: 'warn'},
          loadHooks: ['moduleloader','userconfig','orm', 'http', 'sockets', 'pubsub']
        }, function (err){
          if (err) return done(err);
          return done();
        });
      });
    });
  });

});

