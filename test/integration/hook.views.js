/**
 * Test dependencies
 */

var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var _ = require('lodash');
var fs = require('fs');






describe('hooks :: ', function() {

  describe('views hook', function() {

    var appName = 'testApp';

    before(function(done) {
      appHelper.build(function() {
        fs.writeFileSync('config/extraroutes.js', 'module.exports.routes = {"/resView": function(req, res) { return res.view("homepage"); }, "/resViewNoLayout": function(req, res) { return res.view("homepage", {layout: false}); }, "/resViewBlahLayout": function(req, res) { return res.view("homepage", {layout: "blah"}); }, "/renderView": function(req, res) {req._sails.renderView("homepage", {}, function(err, html) {return res.send(html);});}}');
        fs.writeFileSync('views/blah.ejs', '<BLAH><%-body%></BLAH>');
        return done();
      });
    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

    describe('using res.view', function () {

      before(function(done) {
        appHelper.lift({
          verbose: false,
        }, function(err, sails) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          setTimeout(done, 100);
        });
      });

      after(function(done) {
        sailsprocess.lower(function() {
          setTimeout(done, 100);
        });

      });

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('<!-- Default home page -->') > -1);
          done();
        });
      });

      it('should wrap the view in the default layout', function(done) {

        httpHelper.testRoute('get', 'resView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('<html>') > -1);
          done();
        });
      });

    });

    describe('using res.view with no layout', function () {

      before(function(done) {
        appHelper.lift({
          verbose: false,
        }, function(err, sails) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          setTimeout(done, 100);
        });
      });

      after(function(done) {
        sailsprocess.lower(function() {
          setTimeout(done, 100);
        });

      });

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'resViewNoLayout', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('<!-- Default home page -->') > -1);
          done();
        });
      });

      it('should not wrap the view in the default layout', function(done) {

        httpHelper.testRoute('get', 'resViewNoLayout', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('<html>') === -1);
          done();
        });
      });

    });

    describe('using res.view with an alternate layout', function () {

      before(function(done) {
        appHelper.lift({
          verbose: false,
        }, function(err, sails) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          setTimeout(done, 100);
        });
      });

      after(function(done) {
        sailsprocess.lower(function() {
          setTimeout(done, 100);
        });

      });

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'resViewBlahLayout', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('<!-- Default home page -->') > -1);
          done();
        });
      });

      it('should wrap the view in the alternate layout', function(done) {

        httpHelper.testRoute('get', 'resViewBlahLayout', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('<BLAH>') > -1);
          done();
        });
      });

    });

    describe('using renderView', function () {

      before(function(done) {
        appHelper.lift({
          verbose: false,
        }, function(err, sails) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          setTimeout(done, 100);
        });
      });

      after(function(done) {
        sailsprocess.lower(function() {
          setTimeout(done, 100);
        });

      });

      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'renderView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }
          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('<!-- Default home page -->') > -1);
          done();
        });
      });

    });

    describe('using renderView (with i18n disabled)', function () {

      var appName = 'testApp';

      before(function(done) {
        // Clear the require cache of i18n
        _.each(Object.keys(require.cache), function(path) {
          if (path.match(/\/node_modules\/i18n\//)) {
            delete require.cache[path];
          }
        });

        appHelper.lift({
          verbose: false,
          hooks: {
            i18n: false
          }
        }, function(err, sails) {
          if (err) {
            throw new Error(err);
          }
          sailsprocess = sails;
          setTimeout(done, 100);
        });
      });

      after(function(done) {
        sailsprocess.lower(function() {
          setTimeout(done, 100);
        });

      });


      it('should respond to a get request to localhost:1342 with welcome page', function(done) {

        httpHelper.testRoute('get', 'renderView', function(err, response) {
          if (err) {
            return done(new Error(err));
          }

          assert(response.body.indexOf('not found') < 0);
          assert(response.body.indexOf('<!-- Default home page -->') > -1);
          done();
        });
      });

    });

  });

});
