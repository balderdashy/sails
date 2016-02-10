var _ = require('lodash');
var request = require('request');
var Sails = require('../../lib').Sails;
var assert = require('assert');
var fs = require('fs-extra');
var request = require('request');
var appHelper = require('./helpers/appHelper');
var path = require('path');

describe('middleware :: ', function() {

  describe('static :: ', function() {

    var appName = 'testApp';
    var sailsServer;
    var customFaviconPath = path.resolve(__dirname, 'fixtures/favicon.ico');
    var test_file;

    before(function(done) {
      this.timeout(5000);
      appHelper.build(function(err) {
        if (err) {return done(err);}
        fs.copySync(customFaviconPath, path.resolve('../', appName, '.tmp/public/test.txt'));
        fs.copySync(customFaviconPath, path.resolve('../', appName, '.tmp/public/test.png'));
        fs.copySync(customFaviconPath, path.resolve('../', appName, '.tmp/public/test.woff'));
        test_file = fs.readFileSync(customFaviconPath);
        return done();
      });
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });


    describe('with a test.txt, test.png and test.woff file in the .tmp/public folder', function() {

      before(function(done) {

        appHelper.lift(function(err, _sailsServer) {
          assert(!err);
          sailsServer = _sailsServer;
          return done();
        });
      });

      after(function(done) {
        sailsServer.lower(function() {
          setTimeout(done, 100);
        });
      });

      it('a request to /test.txt should provide the file with the correct content-type header', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/test.txt',
          },
          function(err, response, body) {
            assert.equal(test_file.toString('utf-8'), body);
            assert.equal(response.headers['content-type'], 'text/plain; charset=UTF-8');
            return done();
          }
        );

      });

      it('a request to /test.png should provide the file with the correct content-type header', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/test.png',
          },
          function(err, response, body) {
            assert.equal(test_file.toString('utf-8'), body);
            assert.equal(response.headers['content-type'], 'image/png');
            return done();
          }
        );

      });

      it('a request to /test.woff should provide the file with the correct content-type header', function(done) {

        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/test.woff',
          },
          function(err, response, body) {
            assert.equal(test_file.toString('utf-8'), body);
            assert.equal(response.headers['content-type'], 'application/font-woff');
            return done();
          }
        );

      });

    });

    describe('with cache time set to 5000 ms', function() {

      before(function(done) {

        appHelper.lift({
          http: {
            cache: 5000
          }
        },
        function(err, _sailsServer) {
          assert(!err);
          sailsServer = _sailsServer;
          return done();
        });
      });

      after(function(done) {
        sailsServer.lower(done);
      });

      it('a request to /test.txt should provide the file and a correct cache-control header', function(done) {
        request(
          {
            method: 'GET',
            uri: 'http://localhost:1342/test.txt',
          },
          function(err, response, body) {
            assert.equal(test_file.toString('utf-8'), body);
            assert.equal(response.headers['content-type'], 'text/plain; charset=UTF-8');
            assert.equal(response.headers['cache-control'], 'public, max-age=5');
            return done();
          }
        );
      });

    });

  });

});
