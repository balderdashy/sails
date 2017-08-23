/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');
var async = require('async');

var Filesystem = require('machinepack-fs');

var Sails = require('../../lib').constructor;

tmp.setGracefulCleanup();


describe('helpers :: ', function() {

  describe('basic usage :: ', function() {

    var curDir, tmpDir, sailsApp;

    before(function(done) {
      // Cache the current working directory.
      curDir = process.cwd();
      // Create a temp directory.
      tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.writeSync({
        force: true,
        destination: 'api/helpers/greet.js',
        string: 'module.exports = { inputs: { name: { example: \'bob\', required: true } }, exits: { success: { outputExample: \'Hi, Bob!\'} }, fn: function (inputs, exits) { return exits.success(\'Hi, \' + inputs.name + \'!\'); } }'
      }).execSync();

      (new Sails()).load({
        hooks: {
          grunt: false, views: false, pubsub: false
        },
        log: {level: 'silent'},
        helpers: {
          moduleDefinitions: {
            ucase: { sync: true, inputs: { string: { example: 'Hi, Bob!', required: true } }, exits: { success: { outputExample: 'HI, BOB!'} }, fn: function(inputs, exits) { return exits.success(inputs.string.toUpperCase()); } }
          },
        }
      }, function(err, _sailsApp) {
        if (err) { return done(err); }
        sailsApp = _sailsApp;
        return done();
      });
    });

    after(function(done) {
      process.chdir(curDir);
      if (sailsApp) {sailsApp.lower(done);}
      else {
        return done();
      }
    });

    it('should load helpers from disk and merge them with programmatically added helpers', function() {
      assert.equal(_.keys(sailsApp.helpers).length, 2);
    });

    it('should load asynchronously helpers correctly', function(done) {
      sailsApp.helpers.greet({ name: 'Glen' }).exec({
        error: done,
        success: function ( result ) {
          assert.equal(result, 'Hi, Glen!');
          return done();
        }
      });
    });

    it('should load synchronously helpers correctly', function() {
      var result = sailsApp.helpers.ucase({ string: 'Hi, Glen!' }).execSync();
      assert.equal(result, 'HI, GLEN!');
    });

  });

});
