var _ = require('@sailshq/lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var cookie = require('cookie');



describe('middleware :: ', function() {

  describe('session :: ', function() {

    describe('http requests :: ', function() {

      describe('with a valid session secret', function() {

        var sid;

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
                var count = req.session.count || 1;
                req.session.count = count + 1;
                return res.send('Count is ' + count);
              }
            }
          }, done);
        });

        it('a server responses should supply a cookie with a session ID', function(done) {

          request(
            {
              method: 'GET',
              uri: 'http://localhost:1535/test',
            },
            function(err, response, body) {
              assert.equal(body, 'Count is 1');
              assert(response.headers['set-cookie']);
              var cookies = require('cookie').parse(response.headers['set-cookie'][0]);
              assert(cookies['sails.sid']);
              sid = cookies['sails.sid'];
              return done();
            }
          );
        });

        it('a subsequent request using that session ID in a "Cookie" header should use the same session', function(done) {

          request(
            {
              method: 'GET',
              uri: 'http://localhost:1535/test',
              headers: {
                Cookie: 'sails.sid=' + sid
              }
            },
            function(err, response, body) {
              assert.equal(body, 'Count is 2');
              return done();
            }
          );

        });

        after(function(done) {
          return app.lower(done);
        });

      });





      describe('with an invalid session secret', function() {

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
            hooks: {grunt: false},
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

      describe('requesting a route listed in sails.config.session.routesDisabled (with default settings)', function() {

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
            hooks: {grunt: false},
            routes: {
              '/sails.io.js': function(req, res) {
                return res.status(200).send();
              }
            }
          }, done);
        });

        describe('static asset', function() {

          it('there should be no `set-cookie` header in the response', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/sails.io.js',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(_.isUndefined(response.headers['set-cookie']));
                return done();
              }
            );
          });

        });

        after(function(done) {
          return app.lower(done);
        });

      });

      describe('requesting a route listed in sails.config.session.routesDisabled (custom settings)', function() {

        // Lift a Sails instance in production mode
        var app = Sails();
        before(function (done){
          app.lift({
            globals: false,
            port: 1535,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: 'abc123',
              routesDisabled: ['/test', '/foo/:id/bar/', 'POST /bar', 'ALL /baz']
            },
            hooks: {grunt: false},
            routes: {
              '/test': function(req, res) {
                return res.status(200).send();
              },
              '/bar': function(req, res) {
                return res.status(200).send();
              },
              '/baz': function(req, res) {
                return res.status(200).send();
              },
              '/foo/123/bar': function(req, res) {
                return res.status(200).send();
              },
              '/sails.io.js': function(req, res) {
                return res.status(200).send();
              }


            }
          }, done);
        });

        describe('static path (blank verb)', function() {

          it('there should be no `set-cookie` header in the response when requesting via GET', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/test',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(_.isUndefined(response.headers['set-cookie']));
                return done();
              }
            );
          });

          it('there should be no `set-cookie` header in the response when requesting via HEAD', function(done) {

            request(
              {
                method: 'HEAD',
                uri: 'http://localhost:1535/test',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(response.headers['set-cookie']);
                return done();
              }
            );
          });

        });


        describe('static path (ALL verb)', function() {

          it('there should be no `set-cookie` header in the response when requesting via GET', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/baz',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(_.isUndefined(response.headers['set-cookie']));
                return done();
              }
            );
          });

          it('there should be no `set-cookie` header in the response when requesting via HEAD', function(done) {

            request(
              {
                method: 'HEAD',
                uri: 'http://localhost:1535/baz',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(_.isUndefined(response.headers['set-cookie']));
                return done();
              }
            );
          });
        });

        describe('static path (POST only)', function() {

          it('there should be no `set-cookie` header in the response when requesting via POST', function(done) {

            request(
              {
                method: 'POST',
                uri: 'http://localhost:1535/bar',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(_.isUndefined(response.headers['set-cookie']));
                return done();
              }
            );
          });

          it('there SHOULD be a `set-cookie` header in the response when requesting via GET', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/bar',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(response.headers['set-cookie']);
                return done();
              }
            );
          });

        });

        describe('dynamic path', function() {

          it('there should be no `set-cookie` header in the response', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/foo/123/bar',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(_.isUndefined(response.headers['set-cookie']));
                return done();
              }
            );
          });

        });

        describe('static asset', function() {

          it('there SHOULD be a `set-cookie` header in the response', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/sails.io.js',
              },
              function(err, response, body) {
                assert.equal(response.statusCode, 200);
                assert(response.headers['set-cookie']);
                return done();
              }
            );
          });

        });

        after(function(done) {
          return app.lower(done);
        });

      });

    });

    describe('virtual requests :: ', function() {

      describe('with a valid session secret', function() {

        var sid;

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
            routes: {
              '/test': function(req, res) {
                var count = req.session.count || 1;
                req.session.count = count + 1;
                res.send('Count is ' + count);
              }
            }
          }, done);
        });


        it('a server responses should supply a cookie with a session ID', function(done) {

          app.request(
            {
              method: 'GET',
              url: '/test',
            },
            function(err, response, body) {
              assert.equal(body, 'Count is 1');
              assert(response.headers['set-cookie']);
              var cookies = require('cookie').parse(response.headers['set-cookie'][0]);
              assert(cookies['sails.sid']);
              sid = cookies['sails.sid'];
              return done();
            }
          );
        });

        it('a subsequent request using that session ID in a "Cookie" header should use the same session', function(done) {

          app.request(
            {
              method: 'GET',
              url: '/test',
              headers: {
                Cookie: 'sails.sid=' + sid
              }
            },
            function(err, response, body) {
              assert.equal(body, 'Count is 2');
              return done();
            }
          );

        });

        after(function(done) {
          return app.lower(done);
        });

      });

      describe('requesting a route listed in sails.config.session.routesDisabled', function() {

        // Lift a Sails instance in production mode
        var app = Sails();
        before(function (done){
          app.lift({
            globals: false,
            port: 1535,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: 'abc123',
              routesDisabled: ['/test']
            },
            hooks: {grunt: false},
            routes: {
              '/test': function(req, res) {
                if (_.isUndefined(req.session)) {
                  return res.status(200).send();
                }
                return res.status(500).send();
              }
            }
          }, done);
        });

        it('there should be no `set-cookie` header in the response', function(done) {

          request(
            {
              method: 'GET',
              uri: 'http://localhost:1535/test',
            },
            function(err, response, body) {
              assert.equal(response.statusCode, 200);
              assert(_.isUndefined(response.headers['set-cookie']));
              return done();
            }
          );
        });

        after(function(done) {
          return app.lower(done);
        });

      });


    });

  });

});
