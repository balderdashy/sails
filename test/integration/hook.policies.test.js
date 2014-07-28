/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');




// These tests changed for Sails v0.10 because of the introduction
// of the `findOne` blueprint action, and a change in how GET blueprint
// routes map to actions (e.g. `GET /foo/3` now maps to `findOne()` instead
// of `find()`)
//
// See the upgrade guide for more details and examples:
// https://github.com/balderdashy/sails-docs/blob/master/reference/Upgrading.md#policies


describe('router :: ', function() {

  describe('Policies', function() {
    var appName = 'testApp';

    before(function(done) {
      this.timeout(5000);
      appHelper.build(done);
    });

    beforeEach(function(done) {
      appHelper.lift({
        verbose: false
      }, function(err, sails) {
        if (err) {
          throw new Error(err);
        }
        sailsprocess = sails;
        sailsprocess.once('hook:http:listening', done);
      });
    });

    afterEach(function(done) {
      sailsprocess.kill(done);
    });

    after(function() {
      // console.log('before `chdir ../`' + ', cwd was :: ' + process.cwd());
      process.chdir('../');
      // console.log('after `chdir ../`' + ', cwd was :: ' + process.cwd());
      appHelper.teardown();
    });

    describe('an error in the policy callback', function() {

      before(function() {
        var config = "module.exports.policies = { '*': 'error_policy' };";
        fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
      });

      it('should return a 500 status code and message using default error handling in config/500.js', function(done) {
        httpHelper.testRoute('get', {
          url: 'test',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        }, function(err, response) {
          if (err) return done(err);

          try {
            // console.log('----------------');
            // console.log('Response.body ===> ');
            // console.log(response.body);
            // console.log(response.body.length + ' characters');
            // console.log(response.body.split(''));
            // console.log('----------------');

            assert.equal(response.statusCode, 500);
            assert.equal(
              typeof response.body, 'string',
              util.format('response.body should be a string, instead it is "%s", a %s', response.body, typeof response.body)
            );
            assert.equal(response.body, 'Test Error',
              util.format('`response.body` should === "Test Error" but instead it is "%s"', response.body.error)
            );
          }
          catch (e) {
            return done(e);
          }
          return done();
        });
      });
    });

    describe('custom policies', function() {

      before(function() {
        var policy = {
          'test': {
            'index': 'error_policy'
          }
        };

        var config = "module.exports.policies = " + JSON.stringify(policy);
        fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
      });

      describe('a get request to /:controller', function() {

        it('should return a proper serverError with a message', function(done) {

          httpHelper.testRoute('get', {
            url: 'test',
            headers: {
              'Content-Type': 'application/json'
            },
            json: true
          }, function(err, response) {
            if (err) return done(err);

            try {

              // Assert HTTP status code is correct
              assert.equal(response.statusCode, 500);

              // Assert that response has the proper error message
              assert.equal(response.body, 'Test Error');
            }
            catch (e) { return done(e); }
            return done();
          });
        });
      });

      describe('a get request to /:controller/:id', function() {

        it('should NOT hit the `find` action', function(done) {

          httpHelper.testRoute('get', {
            url: 'test/1',
            headers: {
              'Content-Type': 'application/json'
            },
            json: true
          }, function(err, response) {
            if (err) return done(err);

            assert.notEqual(response.body, "find");
            done();
          });
        });

        it('should hit the `findOne` action', function(done) {
          httpHelper.testRoute('get', {
            url: 'test/1',
            headers: {
              'Content-Type': 'application/json'
            },
            json: true
          }, function(err, response) {
            if (err) return done(err);

            try {
              assert.equal(response.body, 'findOne');
            }
            catch (e) {
              return done(e);
            }
            return done();
          });
        });

        describe('with error_policy', function(done) {

          before(function() {
            var config = "module.exports.policies = { '*': 'error_policy' };";
            fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
          });

          it('should NOT hit the `findOne` action', function(done) {
            httpHelper.testRoute('get', {
              url: 'empty/1',
              headers: {
                'Content-Type': 'application/json'
              },
              json: true
            }, function(err, response) {
              if (err) return done(err);

              try {
                // Assert HTTP status code is correct
                assert.equal(response.statusCode, 500);

                // Assert that response has the proper error message
                assert.equal(response.body, 'Test Error');

              }
              catch (e) {
                return done(e);
              }

              return done();
            });
          });
        });

      });
    });

    describe('chaining policies', function() {

      before(function() {
        var policy = {
          'test': {
            'index': ['fake_auth', 'sessionAuth']
          }
        };

        var config = "module.exports.policies = " + JSON.stringify(policy);
        fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
      });

      describe('a get request to /:controller', function() {

        it('should return a string', function(done) {

          httpHelper.testRoute('get', {
            url: 'test',
            json: true
          }, function(err, response) {
            if (err) return done(err);

            assert.equal(response.body, "index");
            done();
          });
        });
      });
    });

    describe('chaining wildcard "*" policies', function() {

      before(function() {
        var policy = {
          'test': {
            '*': ['fake_auth', 'sessionAuth']
          }
        };

        var config = "module.exports.policies = " + JSON.stringify(policy);
        fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
      });

      describe('a get request to /:controller', function() {

        it('should return a string', function(done) {

          httpHelper.testRoute('get', {
            url: 'test',
            json: true
          }, function(err, response) {
            if (err) return done(err);

            assert.equal(response.body, "index");
            done();
          });
        });
      });
    });

    describe('policies for actions named with capital letters', function() {

      before(function() {
        var policy = {
          '*': false,
          'test': {
            '*': false,
            'CapitalLetters': true
          }
        };

        var config = "module.exports.policies = " + JSON.stringify(policy);
        fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
      });

      describe('a get request to /:controller', function() {

        it('should return a string', function(done) {

          httpHelper.testRoute('get', {
            url: 'test/CapitalLetters',
            json: true
          }, function(err, response) {
            if (err) return done(err);

            assert.equal(response.body, "CapitalLetters");
            done();
          });
        });
      });
    });

    describe('policies added inline to custom routes', function() {

      before(function() {
        var config = 'module.exports.routes = {"get /testPol": [{policy: "error_policy"}]}';
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), config);
      });

      it ('should be applied', function(done) {
        httpHelper.testRoute('get', {
          url: 'testPol',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        }, function(err, response) {
          if (err) return done(err);

          try {
            // Assert HTTP status code is correct
            assert.equal(response.statusCode, 500);

            // Assert that response has the proper error message
            assert.equal(response.body, 'Test Error');

          }
          catch (e) {
            return done(e);
          }

          return done();
        });
      });

    });

  });


});
