/**
 * Test dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var _ = require('@sailshq/lodash');
var fs = require('fs');






describe('router :: ', function() {
  describe('View routes', function() {
    var appName = 'testApp';

    before(function(done) {
      appHelper.build(function() {
        fs.writeFileSync('config/extraroutes.js', 'module.exports.routes = ' + JSON.stringify({
          '/testView': {
            view: 'viewtest/index'
          },
          '/app': {
            view: 'app'
          },
          '/user': {
            view: 'app/user/homepage'
          }
        }));
        return done();
      });
    });

    beforeEach(function(done) {
      appHelper.lift({
        verbose: false
      }, function(err, sails) {
        if (err) {
          throw new Error(err);
        }
        sailsprocess = sails;
        return done();
      });
    });

    afterEach(function(done) {
      sailsprocess.lower(done);
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('with default routing', function() {

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', '', function(err, response) {
          if (err) {
            return done(new Error(err));
          }

          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('<!-- Default home page -->') > -1);
          done();
        });
      });

      it('should wrap the view in the default layout', function(done) {

        httpHelper.testRoute('get', '', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('<html>') > -1);
          done();
        });
      });

    });

    describe('with specified routing using the "view:" syntax', function() {

      it('route with config {view: "app"} should respond to a get request with the "app/index.ejs" view if "app.ejs" does not exist', function(done) {

        httpHelper.testRoute('get', 'app', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('App index file') > -1);
          done();
        });
      });

      it('route with config {view: "viewtest/index"} should respond to a get request with "viewtest/index.ejs"', function(done) {

        httpHelper.testRoute('get', 'testView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('indexView') > -1);
          done();
        });
      });

      it('route with config {view: "app/user/homepage"} should respond to a get request with "app/user/homepage.ejs"', function(done) {

        httpHelper.testRoute('get', 'user', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('I\'m deeply nested!') > -1);
          done();
        });
      });


    });

    xdescribe('with no specified routing', function() {

      before(function() {
        httpHelper.writeRoutes({});
      });

      it('should respond to get request to :controller with the template at views/:controller/index.ejs', function(done) {

        // Empty router file

        httpHelper.testRoute('get', 'viewTest', function(err, response) {
          if (err) {
            return done(new Error(err));
          }

          assert(response.body.indexOf('indexView') !== -1, response.body);
          done();
        });
      });

      it('should respond to get request to :controller/:action with the template at views/:controller/:action.ejs', function(done) {

        httpHelper.testRoute('get', 'viewTest/create', function(err, response) {
          if (err) {
            return done(new Error(err));
          }

          assert(response.body.indexOf('createView') !== -1);
          done();
        });
      });

      it('should merge config.views.locals into the view locals', function(done) {

        httpHelper.testRoute('get', 'viewTest/viewOptions', function(err, response) {
          if (err) {
            return done(new Error(err));
          }

          assert(response.body.indexOf('!bar!') !== -1);
          done();
        });
      });

      it('should allow config.views.locals to be overridden', function(done) {

        httpHelper.testRoute('get', 'viewTest/viewOptionsOverride', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('!baz!') !== -1);
          done();
        });
      });


    });
  });
});
