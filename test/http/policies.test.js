var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var path = require('path');
var fs = require('fs');

describe('Policies', function() {
  var appName = 'testApp';

  before(function(done) {
    appHelper.build(function(err) {
      if(err) return done(err);
      process.chdir(appName);
      done();
    });
  });

  after(function() {
    process.chdir('../');
    appHelper.teardown();
  });

  describe('an error in the policy callback', function() {

    before(function() {
      var config = "module.exports.policies = { '*': 'error_policy' };";
      fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
    });

    it('should return a 500 status code', function(done) {
      httpHelper.testRoute('get', {url: 'test', headers: {'Content-Type': 'application/json'}, json: true}, function(err, response) {
        if (err) done(new Error(err));

        assert.equal(response.statusCode, 500);
        done();
      });
    });

    it('should return default blueprint error', function(done) {
      httpHelper.testRoute('get', {url: 'test', headers: {'Content-Type': 'application/json'}, json: true}, function(err, response) {
        if (err) done(new Error(err));

        assert(response.body instanceof Array);
        assert.equal(response.body[0], 'Test Error');
        done();
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

      it('should return an error', function(done) {

        httpHelper.testRoute('get', {url: 'test', headers: {'Content-Type': 'application/json'}, json: true}, function(err, response) {
          if (err) done(err);

          assert.equal(response.body[0], 'Test Error');
          done();
        });
      });
    });

    describe('a get request to /:controller/:id', function() {

      it('should return a string', function(done) {

        httpHelper.testRoute('get', {url: 'test/1', headers: {'Content-Type': 'application/json'}, json: true}, function(err, response) {
          if (err) done(err);

          assert.equal(response.body, "find");
          done();
        });
      });
    });
  });

  describe('chaining policies', function() {

    before(function() {
      var policy = {
        'test': {
          'index': ['fake_auth', 'authenticated']
        }
      };

      var config = "module.exports.policies = " + JSON.stringify(policy);
      fs.writeFileSync(path.resolve('../', appName, 'config/policies.js'), config);
    });

    describe('a get request to /:controller', function() {

      it('should return a string', function(done) {

        httpHelper.testRoute('get', {url: 'test', json: true}, function(err, response) {
          if (err) done(err);

          assert.equal(response.body, "index");
          done();
        });
      });
    });
  });
});
