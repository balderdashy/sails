var _ = require('lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var cookie = require('cookie');
var redis = require('redis');


describe('middleware :: ', function() {

  describe('session :: ', function() {

    describe.only('with redis adapter ::', function() {

      var redisClient;
      before(function(done) {
        var self = this;
        self.skip();
        return done();
        // Check that we have a Redis server running
        var redisClient = require('redis').createClient();
        var handleRedisError = function() {
          self.skip();
          redisClient.removeListener('connect', handleRedisConnection);
          redisClient =  null;
          return done();
        };
        var handleRedisConnection = function() {
          redisClient.removeListener('error', handleRedisError);
          return done();
        };
        redisClient.once('error', handleRedisError);
        redisClient.once('connect', handleRedisConnection);
      });

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
              hooks: {grunt: false},
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
            this.skip();
            return done();
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

      });

    });

  });

});
