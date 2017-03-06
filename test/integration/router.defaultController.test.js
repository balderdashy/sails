/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');



/**
 * Errors
 */

var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
  }
};



/**
 * Tests
 */

describe('router :: ', function() {
  describe('Default controller routing', function() {
    var appName = 'testApp';
    var liftOptions = {};

    before(function(done) {
      appHelper.build(done);
    });

    beforeEach(function(done) {
      appHelper.lift(liftOptions, function(err, sails) {
        if (err) {
          throw new Error(err);
        }
        sailsprocess = sails;
        setTimeout(done, 100);
      });
    });

    afterEach(function(done) {
      liftOptions = {};
      sailsprocess.lower(function() {
        setTimeout(done, 100);
      });
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });


    describe('requests to :controller/:method', function() {

      it('should call the specified method of the specified controller', function(done) {

        httpHelper.testRoute('get', 'test/index', function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body === 'index', Err.badResponse(response));
          done();
        });
      });

    });

    describe('REST default routes', function() {

      describe('with `action` routes turned on', function() {

        describe('a get request to /:controller', function() {

          it('should call the controller index method', function(done) {

            httpHelper.testRoute('get', 'test', function(err, response) {
              if (err) return done(new Error(err));

              assert(response.body === 'index', Err.badResponse(response));
              done();
            });
          });
        });

      });

      describe('with `action` routes turned off', function() {

        before(function() {
          liftOptions = {
            blueprints: {
              actions: false
            }
          }
        });

        describe('a get request to /:controller', function() {

          it('should call the controller `find` method', function(done) {

            httpHelper.testRoute('get', 'test', function(err, response) {
              if (err) return done(new Error(err));

              assert(response.body === 'find', Err.badResponse(response));
              done();
            });
          });
        });

      });

      describe('a get request to /:controller/:id', function() {

        it('should NOT call the controller\'s `find()` method', function(done) {

          httpHelper.testRoute('get', 'test/1', function(err, response) {
            if (err) return done(new Error(err));

            assert(response.body !== 'find', Err.badResponse(response));
            done();
          });
        });
        it('should call the controller\'s `findOne()` method', function(done) {

          httpHelper.testRoute('get', 'test/1', function(err, response) {
            if (err) return done(new Error(err));

            assert(response.body === 'findOne', Err.badResponse(response));
            done();
          });
        });
      });

      describe('a get request to /:controller/create', function() {

        it('should call the controller create method', function(done) {

          httpHelper.testRoute('get', 'test/create', function(err, response) {
            if (err) return done(new Error(err));

            assert(response.body === 'create', Err.badResponse(response));
            done();
          });
        });
      });

      describe('a post request to /:controller/create', function() {

        it('should call the controller create method', function(done) {

          httpHelper.testRoute('post', 'test/create', function(err, response) {
            if (err) return done(new Error(err));

            assert(response.body === 'create', Err.badResponse(response));
            done();
          });
        });
      });

      describe('a put request to /:controller/:id', function() {

        it('should call the controller update method', function(done) {

          httpHelper.testRoute('put', 'test/1', function(err, response) {
            if (err) return done(new Error(err));

            assert(response.body === 'update', Err.badResponse(response));
            done();
          });
        });
      });

      describe('a delete request to /:controller/:id', function() {

        it('should call the controller destroy method', function(done) {

          httpHelper.testRoute('del', 'test/1', function(err, response) {
            if (err) return done(new Error(err));

            assert(response.body === 'destroy', Err.badResponse(response));
            done();
          });
        });
      });
    });
  });

});
