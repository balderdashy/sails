var _ = require('@sailshq/lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var fs = require('fs-extra');
var request = require('request');
var appHelper = require('./helpers/appHelper');
var path = require('path');

describe('middleware :: ', function() {

  describe('handleBodyParserError :: ', function() {

    var appName = 'testApp';
    var sailsApp;

    before(function(done) {
      appHelper.build(done);
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('default handleBodyParserError middleware', function() {

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

      it('should handle body parser errors', function(done) {

        request(
          {
            method: 'POST',
            uri: 'http://localhost:1342/nothing',
            headers: {
              'Content-type': 'application/json'
            },
            body: '{ foo:'
          },
          function(err, response, body) {
            if (err) { return done(err); }
            assert(body.match('Unable to parse HTTP body'));
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
