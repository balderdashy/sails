var _ = require('@sailshq/lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var fs = require('fs-extra');
var request = require('request');
var appHelper = require('./helpers/appHelper');
var path = require('path');

describe('middleware :: ', function() {

  describe('500 :: ', function() {

    var appName = 'testApp';
    var sailsApp;

    before(function(done) {
      appHelper.build(function(err) {
        if (err) {return done(err);}
        fs.writeFileSync(path.resolve('..', appName, 'views', '500.ejs'), 'bogus err bruh!');
        fs.writeFileSync(path.resolve('..', appName, 'config', 'routes.js'), 'module.exports.routes = { \'/err\': function (req, res) {throw new Error(\'errrr\');} };');
        return done();
      });
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('with no custom 500 handler installed', function() {

      before(function(done) {
        appHelper.lift({
          hooks: {
            pubsub: false
          }
        }, function(err, _sailsApp) {
          if (err) { return done(err); }
          sailsApp = _sailsApp;
          return done();
        });
      });

      it('the default 500 handler should respond to a request that causes an error', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/err',
            headers: {
              'Accept': 'text/html'
            }
          },
          function(err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 500);
            assert(body.match('<html>'));
            assert(body.match('bogus err bruh!'));
            return done();
          }
        );

      });


      after(function(done) {
        sailsApp.lower(done);
      });

    });

    describe('with a custom 500 handler installed', function() {

      before(function(done) {
        appHelper.lift({
          hooks: {
            pubsub: false
          },
          http: {
            middleware: {
              order: [
                'startRequestTimer',
                'cookieParser',
                'session',
                'bodyParser',
                'handleBodyParserError',
                'compress',
                'methodOverride',
                'poweredBy',
                '$custom',
                'router',
                'www',
                'favicon',
                'err'
              ],
              err: function (err, req, res, next) {
                return res.send('custom err bro');
              }
            }
          }
        }, function(err, _sailsApp) {
          if (err) { return done(err); }
          sailsApp = _sailsApp;
          return done();
        });
      });

      it('the custom 500 handler should respond to a request that causes an error', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/err',
            headers: {
              'Accept': 'text/html'
            }
          },
          function(err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 200);
            assert.equal(body, 'custom err bro');
            return done();
          }
        );

      });


      after(function(done) {
        sailsApp.lower(done);
      });

    });

    describe('with 500 left out of a custom middleware order', function() {

      before(function(done) {
        appHelper.lift({
          hooks: {
            pubsub: false
          },
          http: {
            middleware: {
              order: [
                'startRequestTimer',
                'cookieParser',
                'session',
                'bodyParser',
                'handleBodyParserError',
                'compress',
                'methodOverride',
                'poweredBy',
                '$custom',
                'router',
                'www',
                'favicon'
              ]
            }
          }
        }, function(err, _sailsApp) {
          if (err) { return done(err); }
          sailsApp = _sailsApp;
          return done();
        });
      });

      it('the default 500 handler should respond to a request that causes an error', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/err',
            headers: {
              'Accept': 'text/html'
            }
          },
          function(err, response, body) {
            if (err) { return done(err); }
            assert.equal(response.statusCode, 500);
            assert(body.match('<html>'));
            assert(body.match('bogus err bruh!'));
            return done();
          }
        );

      });

      after(function(done) {
        sailsApp.lower(done);
      });

    });

  });

});
