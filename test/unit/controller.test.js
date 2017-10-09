/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');

var Filesystem = require('machinepack-fs');

var Sails = require('../../lib').constructor;

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
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'legacy fn action!\'); }, machineAction: { exits: {success: {outputExample: \'abc123\'} }, fn: function (inputs, exits) { exits.success(\'legacy machine action!\'); } }, underscore_action: function(req, res) { return res.send(); }, \'action-with-dashes\': function(req, res) {  return res.send(); } };'
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
        string: 'module.exports = { exits: {success: {outputExample: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'top level standalone machine!\'); } };'
      }).execSync();
      // Create a nested legacy controller file.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/someFolder/someOtherFolder/NestedLegacyController.js',
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'nested legacy fn action!\'); }, machineAction: { exits: {success: {outputExample: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'nested legacy machine action!\'); } } };'
      }).execSync();
      // Create a nested legacy controller file, with dots in the subdirectory.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/some.folder/some.other.folder/NestedLegacyController.js',
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'nested legacy fn action!\'); }, machineAction: { exits: {success: {outputExample: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'nested legacy machine action!\'); } } };'
      }).execSync();
      // Create a nested action file with a machine.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/someFolder/someOtherFolder/nested-standalone-machine.js',
        string: 'module.exports = { exits: {success: {outputExample: \'abc123\'} },  fn: function (inputs, exits) { exits.success(\'nested standalone machine!\'); } };'
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
          'POST /route1a': 'TopLevelLegacy.fnAction',
          'POST /route2': 'TopLevelLegacyController.machineAction',
          'POST /route3': {
             controller: 'TopLevelLegacyController',
             action: 'fnAction',
          },
          'POST /route4': {
            action: 'toplevellegacy/fnAction',
          },
          'POST /route5': {
            action: 'top-level-standalone-fn'
          },
          'POST /route6': {
            action: 'somefolder/someotherfolder/nestedlegacy/fnaction'
          },
          'POST /route6a': {
            action: 'some/folder/some/other/folder/nestedlegacy/fnaction'
          },
          'POST /route7': {
            action: 'somefolder/someotherfolder/nested-standalone-machine'
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
          'POST /warn4': 'some/unknown/action',
          'POST /warn5': {
            controller: 'UnknownController',
            action: 'unknown/action'
          },

        })
      }).execSync();

      // Load the Sails app.
      (new Sails()).load({hooks: {security: false, grunt: false, views: false, blueprints: false, policies: false, pubsub: false}, log: {level: 'error'}}, function(err, _sails) {
        sailsApp = _sails;
        return done(err);
      });
    });

    after(function(done) {
      sailsApp.lower(function() {
        process.chdir(curDir);
        return done();
      });
    });

    it('should load all of the valid controller actions', function() {
      var expectedActions = [
        'toplevellegacy/fnaction',
        'toplevellegacy/machineaction',
        'toplevellegacy/underscore_action',
        'toplevellegacy/action-with-dashes',
        'top-level-standalone-fn',
        'top-level-standalone-machine',
        'somefolder/someotherfolder/nestedlegacy/fnaction',
        'somefolder/someotherfolder/nestedlegacy/machineaction',
        'some/folder/some/other/folder/nestedlegacy/fnaction',
        'some/folder/some/other/folder/nestedlegacy/machineaction',
        'somefolder/someotherfolder/nested-standalone-machine'
      ];
      var unexpectedActions = _.difference(_.keys(sailsApp._actions), expectedActions);
      assert(!unexpectedActions.length, 'Loaded unexpected actions:\n' + util.inspect(unexpectedActions));
      _.each(expectedActions, function(expectedAction) {
        assert(sailsApp._actions[expectedAction], 'Did not load expected action `' + expectedAction + '`');
        assert(_.isFunction(sailsApp._actions[expectedAction]), 'Expected action `' + expectedAction + '` loaded, but instead of a function it\'s a ' + typeof(sailsApp._actions[expectedAction]));
      });
    });

    it('should bind a route using \'TopLevelLegacyController/fnAction\'', function(done) {
      sailsApp.request('POST /route1', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'legacy fn action!');
        done();
      });
    });

    it('should bind a route using \'TopLevelLegacy/fnAction\'', function(done) {
      sailsApp.request('POST /route1a', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'legacy fn action!');
        done();
      });
    });

    it('should bind a route using \'TopLevelLegacyController/machineAction\'', function(done) {
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

    it('should bind a route using {action: \'toplevellegacy/fnAction\'}', function(done) {
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

    it('should bind a route using {action: \'somefolder/someotherfolder/nestedlegacy/fnaction\'}', function(done) {
      sailsApp.request('POST /route6', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested legacy fn action!');
        done();
      });
    });

    it('should bind a route using {action: \'some/folder/some/other/folder/nestedlegacy/fnaction\'}', function(done) {
      sailsApp.request('POST /route6', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'nested legacy fn action!');
        done();
      });
    });

    it('should bind a route using {action: \'somefolder/someotherfolder/nested-standalone-machine\'}', function(done) {
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

    it('should return a shallow clone of the actions dictionary when `sails.getActions` is called', function() {
      var actions = sailsApp.getActions();
      assert(actions !== sailsApp._actions, 'sails.getActions is supposed to return a shallow clone, but got an exact reference!');
      var expectedActions = [
        'toplevellegacy/fnaction',
        'toplevellegacy/machineaction',
        'toplevellegacy/underscore_action',
        'toplevellegacy/action-with-dashes',
        'top-level-standalone-fn',
        'top-level-standalone-machine',
        'somefolder/someotherfolder/nestedlegacy/fnaction',
        'somefolder/someotherfolder/nestedlegacy/machineaction',
        'some/folder/some/other/folder/nestedlegacy/fnaction',
        'some/folder/some/other/folder/nestedlegacy/machineaction',
        'somefolder/someotherfolder/nested-standalone-machine'
      ];
      var unexpectedActions = _.difference(_.keys(actions), expectedActions);
      assert(!unexpectedActions.length, 'Loaded unexpected actions:\n' + util.inspect(unexpectedActions));
      _.each(expectedActions, function(expectedAction) {
        assert(actions[expectedAction], 'Did not load expected action `' + expectedAction + '`');
        assert(_.isFunction(actions[expectedAction]), 'Expected action `' + expectedAction + '` loaded, but instead of a function it\'s a ' + typeof(actions[expectedAction]));
      });

    });

  });

  describe('with conflicting actions in api/controllers', function() {

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
        destination: 'api/controllers/TopLevelController.js',
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'fn controller action!\'); } };'
      }).execSync();
      // Create a top-level action file with a req/res function.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/toplevel/fnaction.js',
        string: 'module.exports = function (req, res) { res.send(\'standalone fn!\'); };'
      }).execSync();

      return done();

    });

    after(function() {
      process.chdir(curDir);
    });

    it('should fail to load sails', function(done) {
      // Load the Sails app.
      (new Sails()).load({hooks: {grunt: false, views: false, blueprints: false, policies: false, pubsub: false}, log: {level: 'error'}}, function(err, _sails) {
        if (!err) {
          _sails.lower(function() {
            return done(new Error('Should have thrown an error!'));
          });
        }
        assert.equal(err.code, 'E_CONFLICT');
        assert.equal(err.identity, 'toplevel/fnaction');
        return done();
      });

    });

  });

  describe('With a controller with `Controller` in the name', function() {

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
      // Create a top-level legacy controller file with `Controller` in the name.
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/MicroControllerController.js',
        string: 'module.exports = { \'check\': function(req, res) {  return res.send(\'mate\'); } };'
      }).execSync();

      // Write a routes.js file
      Filesystem.writeSync({
        force: true,
        destination: 'config/routes.js',
        string: 'module.exports.routes = ' + JSON.stringify({
          'GET /microcontroller/:id/check':  'MicroControllerController.check',
          'GET /microcontroller/:id/check2': { controller: 'MicroControllerController', action: 'check' },
          'GET /microcontroller/:id/check3': 'microcontroller/check'
        })
      }).execSync();

      // Load the Sails app.
      (new Sails()).load({hooks: {security: false, grunt: false, views: false, blueprints: false, policies: false, pubsub: false}, log: {level: 'error'}}, function(err, _sails) {
        sailsApp = _sails;
        return done(err);
      });
    });

    after(function(done) {
      sailsApp.lower(function() {
        process.chdir(curDir);
        return done();
      });
    });

    it('should bind a route using \'MicroControllerController.check\'', function(done) {
      sailsApp.request('GET /microcontroller/123/check', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'mate');
        done();
      });
    });

    it('should bind a route using { controller: \'MicroControllerController\', action: \'check\' }', function(done) {
      sailsApp.request('GET /microcontroller/123/check2', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'mate');
        done();
      });
    });

    it('should bind a route using \'microcontroller/check\'', function(done) {
      sailsApp.request('GET /microcontroller/123/check3', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'mate');
        done();
      });
    });

  });

});
