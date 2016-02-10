var _ = require('lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var domain = require('domain');
describe('middleware :: ', function() {

  describe('cookie parser :: ', function() {

    describe('with a valid session secret', function() {

      // Lift a Sails instance in production mode
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
          routes: {
            '/test': function(req, res) {
              res.json({
                cookies: req.cookies,
                signedCookies: req.signedCookies
              });
            }
          }
        }, done);
      });

      after(function(done) {
        app.lower(done);
      });

      it('when sending a request with a Cookie: header, req.cookies and req.signedCookies should be populated', function(done) {
        var rawLen = 0, res = '';
        request(
          {
            method: 'GET',
            uri: 'http://localhost:1535/test',
            headers: {
              'cookie': 'foo=bar; owl=s%3Ahoot.v0ELGJM%2B8t4aP0YeUpcC31OKnAQ%2BqUTf%2F4WaLaaosJg; abc=123',
            }
          },
          function(err, response, body) {
            body = JSON.parse(body);
            assert(body.cookies);
            assert(body.signedCookies);
            assert.equal(body.cookies.foo, 'bar');
            assert.equal(body.cookies.abc, '123');
            assert.equal(body.signedCookies.owl, 'hoot');
            assert(!body.cookies.owl);
            return done();
          }
        );
      });

    });

    describe('with no session secret and session hook disabled', function() {

      // Lift a Sails instance in production mode
      var app = Sails();
      before(function (done){
        app.lift({
          globals: false,
          port: 1535,
          environment: 'development',
          log: {level: 'silent'},
          session: {
            secret: null
          },
          hooks: {
            session: false
          },
          routes: {
            '/test': function(req, res) {
              res.json({
                cookies: req.cookies,
                signedCookies: req.signedCookies
              });
            }
          }
        }, done);
      });

      after(function(done) {
        app.lower(done);
      });

      it('when sending a request with a Cookie: header, req.cookies and req.signedCookies should be populated', function(done) {
        var rawLen = 0, res = '';
        request(
          {
            method: 'GET',
            uri: 'http://localhost:1535/test',
            headers: {
              'cookie': 'foo=bar; owl=s%3Ahoot.v0ELGJM%2B8t4aP0YeUpcC31OKnAQ%2BqUTf%2F4WaLaaosJg; abc=123',
            }
          },
          function(err, response, body) {
            body = JSON.parse(body);
            assert(body.cookies);
            assert(body.signedCookies);
            assert.equal(body.cookies.foo, 'bar');
            assert.equal(body.cookies.abc, '123');
            assert.equal(body.cookies.owl, 's:hoot.v0ELGJM+8t4aP0YeUpcC31OKnAQ+qUTf/4WaLaaosJg');
            assert(!body.signedCookies.owl);
            return done();
          }
        );
      });

    });

    describe('with an invalid session secret and session hook disabled', function() {

      var app = Sails();

      // Start an error domain to capture errors during sails.lift
      var d = domain.create();

      it('should throw an error when lifting Sails', function(done) {

        app.lift({
          globals: false,
          port: 1535,
          environment: 'development',
          log: {level: 'silent'},
          session: {
            secret: 12345
          },
          hooks: {
            session: false
          },
          routes: {
            '/test': function(req, res) {
              res.json({
                cookies: req.cookies,
                signedCookies: req.signedCookies
              });
            }
          }
        }, function(err) {
          if (!err) {return done(new Error('Should have thrown an error!'));}
          return done();
        });

      });

      after(function(done) {
        return app.lower(done);
      });

    });

  });

});
