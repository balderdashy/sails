/**
 * Test dependencies
 */
var assert = require('assert');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
var util = require('util');
var wrench = require('wrench');
var path = require('path');
var fs = require('fs-extra');
var Sails = require('../../lib/app');
var async = require('async');

describe('hooks :: ', function() {

  var sailsprocess;

  describe.only('userconfig hook', function() {
    var appName = 'testApp';

      before(function(done) {
        appHelper.teardown();
        this.timeout(5000);
        async.series([
          function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/abc.js'), 'module.exports = {"foo":"goo"};', cb);},
          function(cb) {fs.outputFile(path.resolve(__dirname,'../../testApp/config/foo/bar.js'), 'module.exports = {"foo":"bar", "abc":123};', cb);},
          function(cb) {process.chdir('testApp'); cb();}
        ], done);

      });

      after(function() {
        process.chdir('../');
        appHelper.teardown();
      });

      describe("with default options", function() {

        it("should merge config options regardless of file structure", function(done) {

          Sails().load({hooks:{grunt:false}}, function(err, sails) {
            if (err) return callback(err);
            assert.equal(sails.config.foo, "bar");
            assert.equal(sails.config.abc, 123);
            assert.equal(typeof(sails.config.bar), "undefined");
            return done();
          });

        });

      });

      describe("with 'dontFlattenConfig' true", function() {

        it("should use filenames in subfolders as keys", function(done) {

          Sails().load({hooks:{grunt:false}, dontFlattenConfig: true}, function(err, sails) {
            if (err) return callback(err);
            assert.equal(sails.config.foo, "goo");
            assert.equal(sails.config.bar.foo, "bar");
            assert.equal(sails.config.bar.abc, 123);
            assert.equal(typeof(sails.config.abc), "undefined");
            return done();
          });

        });

      });

  });

});
