/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var request = require('@sailshq/request');
var Sails = require('../../lib').Sails;
var assert = require('assert');







describe('middleware :: ', function() {

  describe('cookie parser :: ', function() {

    describe('http requests :: ', function() {

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
            hooks: {grunt: false, pubsub: false},
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
              if(err){ return done(err); }
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

        after(function(done) {
          app.lower(done);
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
              session: false,
              grunt: false,
              pubsub: false
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
              if(err){ return done(err); }
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

        after(function(done) {
          app.lower(done);
        });

      });

      describe('with an invalid session secret and session hook disabled', function() {

        var app = Sails();

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
              session: false,
              grunt: false,
              pubsub: false
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
          app.lower(done);
        });

      });

    });

    describe('virtual requests :: ', function() {

      describe('with a valid session secret', function() {

        // Lift a Sails instance in production mode
        var app = Sails();
        before(function (done){
          app.load({
            globals: false,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: 'abc123'
            },
            hooks: {
              http: false,
              views: false,
              sockets: false,
              pubsub: false
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

        it('when sending a request with a Cookie: header, req.cookies and req.signedCookies should be populated', function(done) {
          var rawLen = 0, res = '';
          app.request(
            {
              method: 'GET',
              url: '/test',
              headers: {
                'cookie': 'foo=bar; owl=s%3Ahoot.v0ELGJM%2B8t4aP0YeUpcC31OKnAQ%2BqUTf%2F4WaLaaosJg; abc=123',
              }
            },
            function(err, response, body) {
              if(err){ return done(err); }
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

        after(function(done) {
          app.lower(done);
        });

      });

      describe('with no session secret and session hook disabled', function() {

        // Lift a Sails instance in production mode
        var app = Sails();
        before(function (done){
          app.load({
            globals: false,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: null
            },
            hooks: {
              session: false,
              http: false,
              views: false,
              sockets: false,
              pubsub: false
            },
            routes: {
              '/test': function(req, res) {
                return res.json({
                  cookies: req.cookies,
                  signedCookies: req.signedCookies
                });
              }
            }
          }, done);
        });


        it('when sending a request with a Cookie: header, req.cookies and req.signedCookies should be populated', function(done) {
          var rawLen = 0, res = '';
          app.request(
            {
              method: 'GET',
              url: '/test',
              headers: {
                'cookie': 'foo=bar; owl=s%3Ahoot.v0ELGJM%2B8t4aP0YeUpcC31OKnAQ%2BqUTf%2F4WaLaaosJg; abc=123',
              }
            },
            function(err, response, body) {
              if(err){ return done(err); }
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

        after(function(done) {
          app.lower(done);
        });

      });

      describe('with an invalid session secret and session hook disabled', function() {

        var app = Sails();

        it('should throw an error when lifting Sails', function(done) {

          app.load({
            globals: false,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: 12345
            },
            hooks: {
              session: false,
              http: false,
              views: false,
              sockets: false,
              pubsub: false
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
          app.lower(done);
        });

      });

    });

  });

});
