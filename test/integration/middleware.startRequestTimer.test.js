var _ = require('@sailshq/lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var fs = require('fs-extra');
var request = require('request');
var appHelper = require('./helpers/appHelper');
var path = require('path');

describe('middleware :: ', function() {

  describe('startRequestTimer :: ', function() {

    var appName = 'testApp';
    var sailsApp;

    before(function(done) {
      appHelper.build(done);
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('default startRequestTimer middleware', function() {

      before(function(done) {
        appHelper.lift({
          hooks: {
            pubsub: false
          },
          routes: {
            '/time': function(req, res) {
              assert(req._startTime);
              assert(req._startTime instanceof Date);
              res.send();
            }
          }
        }, function(err, _sailsApp) {
          if (err) { return done(err); }
          sailsApp = _sailsApp;
          return done();
        });
      });

      it('should add a _startTime to the request object', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/time',
          },
          function(err, response, body) {
            return done(err);
          }
        );

      });

      after(function(done) {
        sailsApp.lower(done);
      });

    });

  });

});
