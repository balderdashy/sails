/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('lodash');

var Filesystem = require('machinepack-fs');
var httpHelper = require('./helpers/httpHelper.js');
var appHelper = require('./helpers/appHelper');
tmp.setGracefulCleanup();

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

describe('controllers :: ', function() {
  describe('with valid actions', function() {

    var curDir, tmpDir, sailsApp;
    var warn;
    var warnings = [];

    before(function(done) {
      // Cache the current working directory.
      curDir = process.cwd();
      // Create a temp directory.
      tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);
      // Create a top-level legacy controller file.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/TopLevelLegacyController.js',
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'legacy fn action!\'); }, machineAction: { exits: {success: {example: \'abc123\'} }, fn: function (inputs, exits) { exits.success(\'legacy machine action!\'); } } };'
      }).execSync();
      // Create a top-level action file with a req/res function.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/top-level-standalone-fn.js',
        string: 'module.exports = function (req, res) { res.send(\'top level standalone fn!\'); };'
      }).execSync();
      // Create a top-level action file with a machine.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/top-level-standalone-machine.js',
        string: 'module.exports = { exits: {success: {example: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'top level standalone machine!\'); } };'
      }).execSync();
      // Create a nested legacy controller file.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/someFolder/someOtherFolder/NestedLegacyController.js',
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'nested legacy fn action!\'); }, machineAction: { exits: {success: {example: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'nested legacy machine action!\'); } } };'
      }).execSync();
      // Create a nested action file with a machine.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/someFolder/someOtherFolder/nested-standalone-machine.js',
        string: 'module.exports = { exits: {success: {example: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'nested standalone machine!\'); } };'
      }).execSync();
      // Create an invalid legacy controller (doesn't contain a dictionary)
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/LegacyControllerWithFn.js',
        string: 'module.exports = function (req, res) { return res.send(\'garbage\'); };'
      }).execSync();
      // Create an invalid action (doesn't contain a machine)
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/invalid-action.js',
        string: 'module.exports = {};'
      }).execSync();
      // Create an invalid file (doesn't conform to naming conventions)
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/invalidLyNamed-fileController.js',
        string: 'module.exports = {};'
      }).execSync();

      // Write a routes.js file
      Filesystem.writeSync({
        force: true,
        destination: 'config/routes.js',
        string: 'module.exports.routes = ' + JSON.stringify({
          'POST /route1': 'TopLevelLegacyController.fnAction',
          'POST /route2': 'TopLevelLegacyController.machineAction',
          'POST /route3': {
             controller: 'TopLevelLegacyController',
             action: 'fnAction',
          },
          'POST /route4': {
            action: 'toplevellegacy.fnAction',
          },
          'POST /route5': {
            action: 'top-level-standalone-fn'
          },
          'POST /route6': {
            action: 'somefolder.someotherfolder.nestedlegacy.fnaction'
          },
          'POST /route7': {
            action: 'somefolder.someotherfolder.nested-standalone-machine'
          },
          'POST /warn1': {
            controller: 'somefolder/someotherfolder/NestedLegacyController',
            action: 'machineaction'
          },
          'POST /warn2': {
            controller: 'somefolder/someotherfolder/NestedLegacy',
            action: 'machineaction'
          },
          'POST /warn3': 'somefolder/someotherfolder/NestedLegacyController.machineAction',
          'POST /warn4': 'some.unknown.action',
          'POST /warn5': {
            controller: 'UnknownController',
            action: 'unknown.action'
          },

        })
      }).execSync();

      // Load the Sails app.
      appHelper.load({hooks: {views: false, grunt: false}, log: {level: 'error'}}, function(err, _sails) {
        sailsApp = _sails;
        return done(err);
      });
    });

    after(function() {
      sailsApp.lower(function() {
        process.chdir(curDir);
      });
    });

    it('should load all of the valid controller actions', function() {
      var expectedActions = [
        'toplevellegacy.fnaction',
        'toplevellegacy.machineaction',
        'top-level-standalone-fn',
        'top-level-standalone-machine',
        'somefolder.someotherfolder.nestedlegacy.fnaction',
        'somefolder.someotherfolder.nestedlegacy.machineaction',
        'somefolder.someotherfolder.nested-standalone-machine'
      ];
      var unexpectedActions = _.difference(_.keys(sailsApp._actions), expectedActions);
      assert(!unexpectedActions.length, 'Loaded unexpected actions:\n' + util.inspect(unexpectedActions));
      _.each(expectedActions, function(expectedAction) {
        assert(sailsApp._actions[expectedAction], 'Did not load expected action `' + expectedAction + '`');
        assert(_.isFunction(sailsApp._actions[expectedAction]), 'Expected action `' + expectedAction + '` loaded, but instead of a function it\'s a ' + typeof(sails._actions[expectedAction]));
      });
    });

    it('should bind a route using \'TopLevelLegacyController.fnAction\'', function(done) {
      sailsApp.request('POST /route1', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'legacy fn action!');
        done();
      });
    });

    it('should bind a route using \'TopLevelLegacyController.machineAction\'', function(done) {
      sailsApp.request('POST /route2', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'legacy machine action!');
        done();
      });
    });

    it('should bind a route using {controller: \'TopLevelLegacyController\', action: \'fnAction\'}', function(done) {
      sailsApp.request('POST /route3', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'legacy fn action!');
        done();
      });
    });

    it('should bind a route using {action: \'toplevellegacy.fnAction\'}', function(done) {
      sailsApp.request('POST /route4', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'legacy fn action!');
        done();
      });
    });

    it('should bind a route using {action: \'top-level-standalone-fn\'}', function(done) {
      sailsApp.request('POST /route5', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'top level standalone fn!');
        done();
      });
    });

    it('should bind a route using {action: \'somefolder.someotherfolder.nestedlegacy.fnaction\'}', function(done) {
      sailsApp.request('POST /route6', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested legacy fn action!');
        done();
      });
    });

    it('should bind a route using {action: \'somefolder.someotherfolder.nested-standalone-machine\'}', function(done) {
      sailsApp.request('POST /route7', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested standalone machine!');
        done();
      });
    });

    it('should bind a route (under protest) using {controller: \'somefolder/someotherfolder/NestedLegacyController\', action: \'machineaction\'}', function(done) {
      sailsApp.request('POST /warn1', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested legacy machine action!');
        done();
      });
    });

    it('should bind a route (under protest) using {controller: \'NestedLegacy\', action: \'machineaction\'}', function(done) {
      sailsApp.request('POST /warn2', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested legacy machine action!');
        done();
      });
    });

    it('should bind a route (under protest) using \'somefolder/someotherfolder/NestedLegacyController.machineAction\'', function(done) {
      sailsApp.request('POST /warn3', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested legacy machine action!');
        done();
      });
    });

  });

});
