/**
 * Module dependencies
 */

var Sails = require('../../../lib').Sails;


xdescribe('Pubsub hook', function (){
  describe('loading a Sails app', function (){

    describe('without ORM hook', function (){
      var app = Sails();
      it('should fail', function (done){
        app.load({
          globals: false,
          log: {level: 'silent'},
          loadHooks: ['moduleloader','userconfig','pubsub']
        }, function (err){
          if (err) { return done(); }
          return done(new Error('Should have failed to load the pubsub hook w/o the `orm` hook.'));
        });
      });
      after(app.lower);
    });

    describe('without sockets hook', function (){
      var app = Sails();
      it('should fail', function (done){
        app.load({
          globals: false,
          log: {level: 'silent'},
          loadHooks: ['moduleloader','userconfig','orm', 'pubsub']
        }, function (err){
          if (err) { return done(); }
          return done(new Error('Should have failed to load the pubsub hook w/o the `sockets` hook.'));
        });
      });
      after(app.lower);
    });

    describe('without http hook', function (){
      var app = Sails();
      it('should fail', function (done){
        app.load({
          globals: false,
          log: {level: 'silent'},
          loadHooks: ['moduleloader','userconfig','orm', 'sockets', 'pubsub']
        }, function (err){
          if (err) { return done(); }
          return done(new Error('Should have failed to load the pubsub hook w/o the `http` hook.'));
        });
      });
      after(app.lower);
    });

    describe('with `orm` and `sockets` hooks', function (){
      var app = Sails();
      it('should load successfully', function (done){
        app.load({
          globals: false,
          log: {level: 'warn'},
          hooks: {
            sockets: require('sails-hook-sockets'),
            orm: require('sails-hook-orm'),
          },
          loadHooks: ['moduleloader','userconfig','orm', 'http', 'sockets', 'pubsub']
        }, function (err){
          if (err) { return done(err); }
          return done();
        });
      });
      after(app.lower);
    });
  });

});
