/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper');
var appHelper = require('./helpers/appHelper');
var fs = require('fs-extra');



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

    var sailsApp;
    beforeEach(function(done) {
      appHelper.lift({
        log: { level: 'silent' }
      }, function(err, sails) {
        if (err) { return done(err); }
        sailsApp = sails;
        return done();
      });
    });

    afterEach(function(done) {
      sailsApp.lower(done);
    });




    before(function(done) {
      appHelper.build(done);
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
            assert.equal(response.statusCode, 500);
            assert.equal(
              typeof response.body, 'string',
              util.format('response.body should be a string, instead it is "%s", a %s', response.body, typeof response.body)
            );
            assert.equal(response.body, 'Test Error',
              util.format('`response.body` should === "Test Error" but instead it is "%s"', response.body.error)
            );
          } catch (e) {
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
            } catch (e) {
              return done(e);
            }
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
            } catch (e) {
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

              } catch (e) {
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
        var config = 'module.exports.routes = {"get /*": [{policy: "error_policy", skipRegex: /^\\/foo.*$/}], "get /foobar": function(req, res){return res.send("ok!");}}';
        fs.writeFileSync(path.resolve('../', appName, 'config/routes.js'), config);
      });

      it('should be applied', function(done) {
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

          } catch (e) {
            return done(e);
          }

          return done();
        });
      });

      it('should respect options', function(done) {
        httpHelper.testRoute('get', {
          url: 'foobar',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        }, function(err, response) {
          if (err) return done(err);

          try {
            // Assert HTTP status code is correct
            assert.equal(response.statusCode, 200);

            // Assert that response has the proper error message
            assert.equal(response.body, 'ok!');

          } catch (e) {
            return done(e);
          }

          return done();
        });
      });
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });
  });



  describe('Test adding policies from another hooks', function() {
    var appName = 'testApp';

    before(function(done) {
      appHelper.build(done);
    });

    before(function(done) {
      fs.mkdirs(path.resolve(__dirname, "../..", appName, "node_modules"), function(err) {
        if (err) {
          return done(err);
        }

        fs.copySync(path.resolve(__dirname, 'fixtures/hooks/installable/add-policy'),
          path.resolve(__dirname, '../../testApp/node_modules/sails-hook-add-policy'));

        process.chdir(path.resolve(__dirname, "../..", appName));
        done();
      });
    });


    describe('with default settings', function() {

      var sails;

      before(function(done) {
        appHelper.liftQuiet(function(err, _sails) {
          if (err) {
            return done(err);
          }
          sails = _sails;
          return done();
        });
      });

      it('should install a hook into `sails.hooks.add-policy`', function() {
        assert(sails.hooks['add-policy']);
      });

      it('should add policy `forbidden` to app', function() {
        assert(sails.hooks.policies.middleware.forbidden);
      });

      after(function(done) {
        sails.lower(done);
      });

    });

    describe('with policy usage', function() {

      var sails;

      var policy = {
        '*': 'error_policy',

        'test': {
          'index': 'forbidden'
        }
      };

      before(function(done) {
        appHelper.lift({
          policies: policy
        }, function(err, _sails) {
          if (err) {
            return done(err);
          }
          sails = _sails;
          return done();
        });
      });

      it('should return `statusCode` 403 ', function(done) {

        httpHelper.testRoute('get', {
          url: 'test/index',
          json: true
        }, function(err, response) {
          if (err) return done(err);

          assert.equal(response.statusCode, 403);
          done();
        });
      });

      it('default policies should also work', function(done) {
        httpHelper.testRoute('get', {
          url: 'test/1',
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        }, function(err, response) {
          if (err) { return done(err); }

          try {
            assert.equal(response.statusCode, 500);
            assert.equal(
              typeof response.body, 'string',
              util.format('response.body should be a string, instead it is "%s", a %s', response.body, typeof response.body)
            );
            assert.equal(response.body, 'Test Error',
              util.format('`response.body` should === "Test Error" but instead it is "%s"', response.body.error)
            );
          } catch (e) {
            return done(e);
          }
          return done();
        });
      });

      after(function(done) {
        sails.lower(done);
      });
    });


    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });
  });

});
