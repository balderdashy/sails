/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');
var path = require('path');
var fs = require('fs-extra');
var Sails = require('../../lib/app');
var async = require('async');




describe('hooks :: ', function() {

  describe('userconfig hook', function() {
    var appName = 'testApp';

    before(function(done) {
      appHelper.teardown();
      async.series([
        function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/abc.js'), 'module.exports = {"foo":"goo"};', cb);},
        function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/foo/bar.js'), 'module.exports = {"foo":"bar", "abc":123};', cb);},
        function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/env/development.js'), 'module.exports = {"cat":"meow"};', cb);},
        function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/env/development/config.js'), 'module.exports = {"owl":"hoot"};', cb);},
        function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/env/test-development.js'), 'module.exports = {"duck":"quack"};', cb);},
        function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/env/test-development/config.js'), 'module.exports = {"dog":"woof"};', cb);},
        function(cb) {process.chdir('testApp'); cb();}
      ], done);

    });


    describe('with default options', function() {

      var sailsApp;

      it('should merge config options regardless of file structure', function(done) {

        sailsApp = Sails();
        sailsApp.load({hooks:{grunt:false}}, function(err, sails) {
          if (err) { return callback(err); }
          assert.equal(sails.config.foo, 'bar');
          assert.equal(sails.config.abc, 123);
          assert.equal(typeof(sails.config.bar), 'undefined');
          return done();
        });

      });

      after(function (done){
        sailsApp.lower(done);
      });

    });

    describe('with \'dontFlattenConfig\' true', function() {

      var sailsApp;
      it('should use filenames in subfolders as keys', function(done) {

        sailsApp = Sails();
        sailsApp.load({hooks:{grunt:false}, dontFlattenConfig: true}, function(err, sails) {
          if (err) { return callback(err); }
          assert.equal(sails.config.foo, 'goo');
          assert.equal(sails.config.bar.foo, 'bar');
          assert.equal(sails.config.bar.abc, 123);
          assert.equal(typeof(sails.config.abc), 'undefined');
          return done();
        });

      });

      after(function (done){
        sailsApp.lower(done);
      });

    });

    describe('in development environment', function() {

      var sails;
      before(function(done) {
        sails = Sails();
        sails.load({hooks:{grunt:false}, dontFlattenConfig: true}, done);
      });

      it('should load config from config/env/development.js', function() {
        assert.equal(sails.config.cat, 'meow');
      });

      it('should load config from config/env/development/** files', function() {
        assert.equal(sails.config.owl, 'hoot');
      });

      it('should not load config from config/env/test-development/** files', function() {
        assert(!sails.config.dog);
      });

      it('should not load config from config/env/test-development.js', function() {
        assert(!sails.config.duck);
      });

      after(function (done){
        sails.lower(done);
      });

    });

    describe('in test-development environment', function() {

      var sails;
      before(function(done) {
        sails = Sails();
        sails.load({hooks:{grunt:false}, dontFlattenConfig: true, environment: 'test-development'}, done);
      });

      it('should load config from config/env/test-development.js', function() {
        assert.equal(sails.config.duck, 'quack');
      });

      it('should load config from config/env/test-development/** files', function() {
        assert.equal(sails.config.dog, 'woof');
      });

      it('should not load config from config/env/development/** files', function() {
        assert(!sails.config.owl);
      });

      it('should not load config from config/env/development.js', function() {
        assert(!sails.config.cat);
      });

      after(function (done){
        sails.lower(done);
      });

    });

    after(function() {
      process.chdir('../');
      appHelper.teardown();
    });

  });
});
