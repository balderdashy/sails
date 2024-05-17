/**
 * Module dependencies
 */

var assert = require('assert');
var util = require('util');
var Sails = require('../../../lib').Sails;
var $Router = require('../../helpers/router');
var request = require('@sailshq/request');

describe('HTTP hook', function (){

  describe('with custom bodyparser middleware config', function() {

    var app;
    before(function(done) {
      app = Sails();
      app.lift({
        globals: false,
        loadHooks: [
          'moduleloader',
          'userconfig',
          'http'
        ],
        log: {level: 'silent'},
        http: {
          middleware: {
            bodyParser: function(req, res, next) {
              req.foo = 'bar';
              return next();
            }
          }
        },
        routes: {
          'get /': function(req, res) {return res.send(req.foo);}
        },
        port: 1342
      }, done);
    });

    it('should be able to respond to requests using the custom bodyparser', function(done) {
      request.get('http://localhost:1342', function(err, res, body) {
        if (err) { return done(err); }
        try {
          assert.equal(body, 'bar');
        }
        catch (e) {return done(e);}
        return done();
      });
    });

    after(function(done) {
      app.lower(done);
    });
  });

  describe('with invalid `trustProxy` config', function() {

    it('should throw an error', function(done) {

      var app = Sails();
      app.lift({
        globals: false,
        port: 1535,
        environment: 'development',
        log: {level: 'silent'},
        http: {
          trustProxy: ''
        },
        hooks: {grunt: false, pubsub: false},
      }, function(err, _app) {

        if (err && err.code && err.code === 'E_HTTP_BAD_TRUSTPROXY') {
          return done();
        }

        if (err) {
          return done(err);
        }

        _app.lower(function(err) {
          if (err) {
            return done(new Error('App lifted when it should have failed with E_HTTP_BAD_TRUSTPROXY.  Additionally, an error occurred while lowering: ' + util.inspect(err)));
          }
          return done(new Error('App lifted when it should have failed with E_HTTP_BAD_TRUSTPROXY'));
        });

      });

    });

  });

});
