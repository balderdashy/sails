var _ = require('lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var fs = require('fs-extra');
var request = require('request');
var appHelper = require('./helpers/appHelper');
var path = require('path');

describe('middleware :: ', function() {

  describe('favicon :: ', function() {

    var appName = 'testApp';

    before(function(done) {
      this.timeout(5000);
      appHelper.build(done);
    });

    after(function() {
      process.chdir('../');
      // appHelper.teardown();
    });

    describe('with no favicon file in the assets folder', function() {

      before(function(done) {
        appHelper.lift(function(err, _sailsServer) {
          assert(!err);
          sailsServer = _sailsServer;
          return done();
        });
      });

      after(function(done) {
        sailsServer.lower(done);
      });

      it('the default sailboat favicon should be provided', function(done) {

        var default_favicon = fs.readFileSync(path.resolve(__dirname, '../../lib/hooks/http/public/favicon.ico'));
        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/favicon.ico',
          },
          function(err, response, body) {
            assert.equal(default_favicon.toString('utf-8'), body);
            return done();
          }
        );

      });

    });

  });

});
