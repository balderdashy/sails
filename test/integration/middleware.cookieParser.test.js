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

      describe('when lifting again with the same `sails.config.http` dictionary (e.g. `require(\'./config/http\').http` in a test suite)', function() {

        var httpConfig = { middleware: {} };
        var liftOpts = function() {
          return {
            globals: false,
            port: 1535,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: 'abc123'
            },
            hooks: {grunt: false, pubsub: false},
            http: httpConfig,
            routes: {
              '/test': function(req, res) {
                res.json({
                  cookies: req.cookies,
                  signedCookies: req.signedCookies
                });
              }
            }
          };
        };

        var app;
        before(function (done){
          var firstApp = Sails();
          firstApp.lift(liftOpts(), function(err) {
            if (err) { return done(err); }
            firstApp.lower(function(err) {
              if (err) { return done(err); }
              app = Sails();
              app.lift(liftOpts(), done);
            });
          });
        });

        it('should lift, and req.cookies and req.signedCookies should be populated', function(done) {
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
              assert.equal(body.cookies.foo, 'bar');
              assert.equal(body.signedCookies.owl, 'hoot');
              return done();
            }
          );
        });

        after(function(done) {
          if (!app) { return done(); }
          app.lower(done);
        });

      });

      describe('with a custom `cookieParser` middleware', function() {

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
            http: {
              middleware: {
                cookieParser: function customCookieParser(req, res, next) {
                  req.cookies = { custom: 'yes' };
                  req.signedCookies = {};
                  return next();
                }
              }
            },
            routes: {
              '/test': function(req, res) {
                res.json({
                  cookies: req.cookies
                });
              }
            }
          }, done);
        });

        it('should lift, and use the custom middleware', function(done) {
          request(
            {
              method: 'GET',
              uri: 'http://localhost:1535/test',
              headers: {
                'cookie': 'foo=bar',
              }
            },
            function(err, response, body) {
              if(err){ return done(err); }
              body = JSON.parse(body);
              assert.deepEqual(body.cookies, { custom: 'yes' });
              return done();
            }
          );
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
