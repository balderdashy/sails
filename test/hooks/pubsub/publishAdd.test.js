/**
 * Module dependencies
 */

var Sails = require('../../../lib').Sails;


describe('Pubsub hook', function (){

  describe('publishAdd()', function (){

    var app = Sails();

    // Setup
    before(function (done){
      app.load({
        globals: false,
        log: {level: 'warn'},
        loadHooks: ['moduleloader','userconfig','orm', 'http', 'sockets', 'pubsub']
      }, function (err){
        if (err) return done(err);
        return done();
      });
    });

    // Teardown
    after(function (done){
      app.lower(done);
    });



    describe('invoked with the id of the child record', function (){
      it('should notify client sockets subscribed to parent record');
    });

    describe('invoked with the entire child record', function (){
      it('should notify client sockets subscribed to parent record');
    });

  });
});

