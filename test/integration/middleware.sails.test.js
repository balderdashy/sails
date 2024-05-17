/**
 * Module dependencies
 */

var request = require('@sailshq/request');
var Sails = require('../../lib').Sails;
var assert = require('assert');





describe('middleware :: ', function() {

  describe('sails :: ', function() {

    describe('http requests :: ', function() {

      var sid;

      // Lift a Sails instance.
      var app = Sails();
      before(function (done){
        app.lift({
          globals: false,
          port: 1535,
          environment: 'development',
          log: {level: 'silent'},
          session: {
            secret: 'abc123'
          },
          hooks: {
            grunt: false,
            request: false,
            pubsub: false
          },
          routes: {
            '/test': function(req, res) {
              var defined = (req._sails !== undefined) ? 'defined' : 'undefined';
              res.send('req._sails is ' + defined);
            }
          }
        }, done);
      });


      it('req._sails should be set if request hook is disabled', function(done) {

        request({
          method: 'GET',
          uri: 'http://localhost:1535/test',
        }, function(err, response, body) {
          if (err) { return done(err); }
          assert.equal(body, 'req._sails is defined');
          return done();
        });
      });

      after(function(done) {
        return app.lower(done);
      });

    });

  });

});
