/**
 * Test dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');




/**
 * Errors
 */
var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
  }
};


describe('router :: ', function() {

  var sailsprocess;

  describe('API scaffold routes', function() {
    var appName = 'testApp';

    before(function(done) {
      appHelper.build(done);
    });

    beforeEach(function(done) {
      appHelper.lift(function(err, sails) {
        if (err) {
          throw new Error(err);
        }
        sailsprocess = sails;
        setTimeout(done, 100);
      });
    });

    afterEach(function(done) {
      sailsprocess.lower(function() {
        setTimeout(done, 100);
      });
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('a get request to /:controller/create', function() {

      it('should return JSON for a newly created instance of the test model', function(done) {

        httpHelper.testRoute('get', {
          url: 'empty/create',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.body.id === 1, Err.badResponse(response));
          done();
        });
      });
    });

    describe('a post request to /:controller/create', function() {

      it('should return JSON for a newly created instance of the test model', function(done) {

        httpHelper.testRoute('post', {
          url: 'empty/create',
          json: true,
          body: {}
        }, function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body.id === 2, Err.badResponse(response));
          done();
        });
      });
    });

    describe('a get request to /:controller', function() {

      it('should return JSON for all instances of the test model', function(done) {

        httpHelper.testRoute('get', {
          url: 'empty',
          json: true
        }, function(err, response) {
          if (err) return done(new Error(err));
          if (typeof response.body !== 'object' || !response.body.length) {
            return done(new Error('Invalid response body: ' + util.format(response.body)));
          }

          assert(response.body[0] && response.body[0].id === 1, Err.badResponse(response));
          assert(response.body[1] && response.body[1].id === 2, Err.badResponse(response));
          done();
        });
      });
    });

    describe('a get request to /:controller/:id', function() {

      it('should return JSON for the instance of the test model with the specified id', function(done) {

        httpHelper.testRoute('get', {
          url: 'empty/1',
          json: true
        }, function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body.id === 1, Err.badResponse(response));
          done();
        });
      });
    });

    describe('a put request to /:controller/:id', function() {

      it('should return JSON for the updated instance of the test model', function(done) {

        httpHelper.testRoute('put', {
          url: 'empty/1?foo=bar',
          json: true
        }, function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body.foo === 'bar', Err.badResponse(response));
          done();
        });
      });
    });

    describe('a post request to /:controller/:id', function() {

      it('should return JSON for the updated instance of the test model', function(done) {

        httpHelper.testRoute('post', {
          url: 'empty/1?foo=baz',
          json: true
        }, function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body.foo === 'baz', Err.badResponse(response));
          done();
        });
      });
    });

    describe('a put request to /:controller/:id attempting to change the primary key', function() {

      it('should return JSON for the updated instance of the test model, but should not update the primary key', function(done) {

        httpHelper.testRoute('post', {
          url: 'empty/1?foo=blap&id=5',
          json: true
        }, function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body.foo === 'blap', Err.badResponse(response));
          assert(response.body.id === 1, Err.badResponse(response));
          done();
        });
      });
    });


    describe('a delete request to /:controller/:id', function() {

      it('should return JSON for the destroyed instance of the test model', function(done) {

        httpHelper.testRoute('del', {
          url: 'empty/1',
          json: true
        }, function(err, response) {
          if (err) return done(new Error(err));

          assert(response.body.id === 1, Err.badResponse(response));
          done();
        });
      });
    });

    describe('a post of JSON array request to /:controller/create', function() {
      it('should return JSON array for a newly created instances of the test model', function(done) {
        httpHelper.testRoute('post', {
          url: 'empty/create',
          json: true,
          body: [{
            stuff: "bad"
          }, {
            stuff: "ghuud"
          }]
        }, function(err, response) {
          if (err) return done(new Error(err));
          assert(response.body instanceof Array, Err.badResponse(response));
          assert.equal(response.body.length, 2, Err.badResponse(response));
          assert.equal(response.body[1].stuff, "ghuud", Err.badResponse(response));
          done();
        });
      });
    });

    describe('with pluralize turned on', function() {

      before(function() {
        httpHelper.writeBlueprint({
          pluralize: true
        });
      });

      it('should bind blueprint actions to plural controller names', function(done) {
        httpHelper.testRoute('get', {
          url: 'empties',
          json: true
        }, function(err, response) {
          if (err) done(new Error(err));

          assert(response.body instanceof Array);
          done();
        });
      });

      it('should bind blueprint actions to plural controller names (quiz => quizzes)', function(done) {
        httpHelper.testRoute('get', {
          url: 'quizzes',
          json: true
        }, function(err, response) {
          if (err) done(new Error(err));

          assert(response.body instanceof Array);
          done();
        });
      });

      it('should not bind blueprint actions to singular controller names', function(done) {
        httpHelper.testRoute('get', {
          url: 'empty',
          json: true
        }, function(err, response) {
          if (err) done(new Error(err));

          assert(response.statusCode === 404);
          done();
        });
      });

      it('should not bind blueprint actions to singular controller names (quiz)', function(done) {
        httpHelper.testRoute('get', {
          url: 'quiz',
          json: true
        }, function(err, response) {
          if (err) done(new Error(err));

          assert(response.statusCode === 404);
          done();
        });
      });
    });

    describe('with `prefix` option set :: ', function() {

      before(function() {
        httpHelper.writeBlueprint({
          prefix: '/api'
        });
      });

      it('should not bind blueprint actions without prefix', function(done) {
        httpHelper.testRoute('get', {
          url: 'empty',
          json: true
        }, function(err, response) {
          if (err) done(new Error(err));

          assert(response.statusCode === 404);
          done();
        });
      });

      it('should return JSON for a newly created instance of the test model called with prefix', function(done) {

        httpHelper.testRoute('get', {
          url: 'api/empty/create',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert((response.statusCode === 201 || response.statusCode === 200));
          done();
        });
      });

      it('should bind blueprint actions with given prefix', function(done) {
        httpHelper.testRoute('get', {
          url: 'api/empty',
          json: true
        }, function(err, response) {
          if (err) done(new Error(err));

          assert(response.body instanceof Array);
          done();
        });
      });

    });

    describe('with `restPrefix` option set :: ', function() {

      before(function() {
        httpHelper.writeBlueprint({
          restPrefix: '/api'
        });
      });

      it('API should be accessible without restPrefix ', function(done) {

        httpHelper.testRoute('get', {
          url: 'empty/create',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.statusCode === 201);
          done();
        });
      });


      it('API should not be accessible with restPrefix ', function(done) {
        httpHelper.testRoute('get', {
          url: 'api/empty/create',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.statusCode === 404);
          done();
        });
      });

      it('REST actions should be accessible only with `restPrefix` set ', function(done) {
        httpHelper.testRoute('get', {
          url: 'api/empty',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.body instanceof Array);
          done();
        });
      });

      it('REST GET action could not be accessible without `restPrefix` ', function(done) {
        httpHelper.testRoute('get', {
          url: 'empty',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.statusCode === 404);
          done();
        });
      });

    });


    describe('`prefix` and `restPrefix` config options set together :: ', function() {

      before(function() {
        httpHelper.writeBlueprint({
          prefix: '/api',
          restPrefix: '/rest'
        });
      });

      it('API should not be accessible with `restPrefix` only with `prefix` ', function(done) {
        httpHelper.testRoute('get', {
          url: 'api/empty/create',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.statusCode === 201);
          done();
        });
      });

      it('REST should be accessible via `prefix` + `restPrefix`', function(done) {
        httpHelper.testRoute('get', {
          url: 'api/rest/empty',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.body instanceof Array);
          done();
        });
      });

    });


  });

  describe('API scaffold routes', function() {
    var appName = 'testApp';

    before(function(done) {
      appHelper.build(function() {
        appHelper.lift(function(err, sails) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          setTimeout(done, 100);
        });
      });
    });

    after(function(done) {
      process.chdir('../');
      appHelper.teardown();
      sailsprocess.lower(function() {
        setTimeout(done, 100);
      });
    });

    describe('sorting via query params', function() {

      before(function(done) {

        sailsprocess.models.user.create([{
          name: 'scott'
        }, {
          name: 'abby'
        }, {
          name: 'joe'
        }, {
          name: 'scott'
        }]).exec(done);

      });

      it('using a string like "name DESC" should return values sorted in descending order by name', function(done) {

        httpHelper.testRoute('get', {
          url: 'user?sort=name DESC',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.body instanceof Array);
          assert.equal(response.body[0].name, "scott");
          assert.equal(response.body[1].name, "scott");
          assert.equal(response.body[2].name, "joe");
          assert.equal(response.body[3].name, "abby");
          done();
        });

      });

      it('using a string like "name ASC" should return values sorted in ascending order by name', function(done) {

        httpHelper.testRoute('get', {
          url: 'user?sort=name ASC',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.body instanceof Array);
          assert.equal(response.body[0].name, "abby");
          assert.equal(response.body[1].name, "joe");
          assert.equal(response.body[2].name, "scott");
          assert.equal(response.body[3].name, "scott");
          done();
        });

      });

      it('using a string like {"name":1} should return values sorted in ascending order by name', function(done) {

        httpHelper.testRoute('get', {
          url: 'user?sort={"name":1}',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));

          assert(response.body instanceof Array);
          assert.equal(response.body[0].name, "abby");
          assert.equal(response.body[1].name, "joe");
          assert.equal(response.body[2].name, "scott");
          assert.equal(response.body[3].name, "scott");
          done();
        });

      });

      it('using a string like {"name":1, "id"-1} should return values sorted in ascending order by name, then descending order by id', function(done) {

        httpHelper.testRoute('get', {
          url: 'user?sort={"name":1, "user_id":-1}',
          json: true
        }, function(err, response, body) {
          if (err) return done(new Error(err));
          assert(response.body instanceof Array);
          assert.equal(response.body[0].name, "abby");
          assert.equal(response.body[1].name, "joe");
          assert.equal(response.body[2].name, "scott");
          assert.equal(response.body[2].user_id, 4);
          assert.equal(response.body[3].name, "scott");
          assert.equal(response.body[3].user_id, 1);
          done();
        });

      });

    });
  });

});
