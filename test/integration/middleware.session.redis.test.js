var _ = require('@sailshq/lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var cookie = require('cookie');
var tmp = require('tmp');
var path = require('path');
var fs = require('fs-extra');

if (process.env.TEST_REDIS_SESSION) {

  describe('middleware :: ', function() {

    describe('session :: ', function() {

      describe('with redis adapter ::', function() {

        var curDir, tmpDir;

        before(function() {
          // Cache the current working directory.
          curDir = process.cwd();
          // Create a temp directory.
          tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
          // Switch to the temp directory.
          process.chdir(tmpDir.name);
          // Ensure a symlink to the connect-redis adapter.
          fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', 'node_modules', 'connect-redis'), path.resolve(tmpDir.name, 'node_modules', 'connect-redis'));
        });

        after(function() {
          process.chdir(curDir);
        });

        it('should fail to lift if the Redis server can\'t be reached', function(done) {

          var app = Sails();
          app.lift({

            globals: false,
            environment: 'development',
            log: {level: 'silent'},
            session: {
              secret: 'abc123',
              adapter: 'connect-redis',
              port: 6300
            },
            hooks: {grunt: false},
            routes: {
              '/test': function(req, res) {
                var count = req.session.count || 1;
                req.session.count = count + 1;
                return res.send('Count is ' + count);
              }
            }

          }, function(err) {
            if (err && err.code === 'ECONNREFUSED') {
              return done();
            }
            else if (err) {
              return done(err);
            }
            else {
              return done(new Error('Expected an error, but Sails appears to have lifted!'));
            }
          });
        });

        describe('http requests :: ', function() {

          var sid;

          // Lift two Sails instances connected to the same Redis server
          var app1 = Sails();
          var app2 = Sails();
          before(function (done){

            var liftOptions = {
              globals: false,
              environment: 'development',
              log: {level: 'silent'},
              session: {
                secret: 'abc123',
                pass: 'secret',
                db: 3,
                adapter: 'connect-redis',
                port: 6380
              },
              hooks: {grunt: false},
              routes: {
                '/test': function(req, res) {
                  var count = req.session.count || 1;
                  req.session.count = count + 1;
                  return res.send('Count is ' + count);
                }
              }
            };

            app1.lift(_.extend({port: 1535}, _.cloneDeep(liftOptions)), function(err) {
              if (err) {return done(err);}
              app2.lift(_.extend({port: 1536}, _.cloneDeep(liftOptions)), function(err) {
                if (err) {return done(err);}
                return done();
              });
            });
          });

          it('a server responses should supply a cookie with a session ID', function(done) {
            request(
              {
                method: 'GET',
                uri: 'http://localhost:1535/test',
              },
              function(err, response, body) {
                if (err) {return done(err);}
                assert.equal(body, 'Count is 1');
                assert(response.headers['set-cookie']);
                var cookies = require('cookie').parse(response.headers['set-cookie'][0]);
                assert(cookies['sails.sid']);
                sid = cookies['sails.sid'];
                return done();
              }
            );
          });

          it('a subsequent request to a different app sharing the same session store, with the same cookie, should retrieve the same session', function(done) {

            request(
              {
                method: 'GET',
                uri: 'http://localhost:1536/test',
                headers: {
                  Cookie: 'sails.sid=' + sid
                }
              },
              function(err, response, body) {
                if (err) {return done(err);}
                assert.equal(body, 'Count is 2');
                return done();
              }
            );

          });

          after(function(done) {
            return app1.lower(function(err) {if(err) {return done(err);} app2.lower(done);});
          });


        });

        describe('virtual requests :: ', function() {

          var sid;

          // Lift two Sails instances connected to the same Redis server
          var app1 = Sails();
          var app2 = Sails();
          before(function (done){

            var liftOptions = {
              globals: false,
              environment: 'development',
              log: {level: 'silent'},
              session: {
                secret: 'abc123',
                adapter: 'connect-redis',
                pass: 'secret',
                db: 3,
                port: 6380
              },
              hooks: {grunt: false},
              routes: {
                '/test': function(req, res) {
                  var count = req.session.count || 1;
                  req.session.count = count + 1;
                  return res.send('Count is ' + count);
                }
              }
            };

            app1.lift(_.extend({port: 1535}, _.cloneDeep(liftOptions)), function(err) {
              if (err) {return done(err);}
              app2.lift(_.extend({port: 1536}, _.cloneDeep(liftOptions)), function(err) {
                if (err) {return done(err);}
                return done();
              });
            });
          });

          it('a server responses should supply a cookie with a session ID', function(done) {
            app1.request(
              {
                method: 'GET',
                url: '/test',
              },
              function(err, response, body) {
                if (err) {return done(err);}
                assert.equal(body, 'Count is 1');
                assert(response.headers['set-cookie']);
                var cookies = require('cookie').parse(response.headers['set-cookie'][0]);
                assert(cookies['sails.sid']);
                sid = cookies['sails.sid'];
                return done();
              }
            );
          });

          it('a subsequent request to a different app sharing the same session store, with the same cookie, should retrieve the same session', function(done) {

            app2.request(
              {
                method: 'GET',
                url: '/test',
                headers: {
                  Cookie: 'sails.sid=' + sid
                }
              },
              function(err, response, body) {
                if (err) {return done(err);}
                assert.equal(body, 'Count is 2');
                return done();
              }
            );

          });

          after(function(done) {
            return app1.lower(function(err) {if(err) {return done(err);} app2.lower(done);});
          });


        });

      });

    });

  });
}
