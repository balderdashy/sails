/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('lodash');

var Filesystem = require('machinepack-fs');

var Sails = require('../../lib').constructor;

tmp.setGracefulCleanup();

describe('sails.reloadModules ::', function() {

  describe('basic usage ::', function() {

    var curDir, tmpDir, sailsApp;

    var userHookStuff = 'foo';

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

      // Load the Sails app.
      (new Sails()).load({
        hooks: {
          grunt: false, views: false, blueprints: false, policies: false,
          myHook: function() {return {initialize: function(cb) {return cb();}, loadModules: function(cb) {this.stuff = userHookStuff; return cb();}};}
        },
        log: {level: 'error'}
      }, function(err, _sails) {
        sailsApp = _sails;
        assert(sailsApp._actions['toplevel.fnaction'], 'Expected to find a `toplevel.fnaction` action, but didn\'t.');
        assert(!sailsApp._actions['toplevel.machineaction'], 'Didn\'t expect `toplevel.machineaction` action to exist!');
        assert(!sailsApp._actions['nested.standalone-action'], 'Didn\'t expect `nested.standalone-action` action to exist!');
        assert.equal(sails.hooks.myHook.stuff, 'foo');
        return done(err);
      });
    });

    after(function(done) {
      sailsApp.lower(function() {
        process.chdir(curDir);
        return done();
      });
    });

    it('should reload all modules when no `hooksToSkip` is provided', function(done) {
      userHookStuff = 'bar';
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/TopLevelController.js',
        string: 'module.exports = { fnAction: function (req, res) { res.send(\'fn controller action!\'); }, machineAction: { fn: function (inputs, exits) { exits.success(\'machine!\'); } } };'
      }).execSync();
      Filesystem.writeSync({
        force: true,
        destination: 'api/controllers/nested/standalone-action.js',
        string: 'module.exports = function (req, res) { res.send(\'standalone action!\'); };'
      }).execSync();
      sailsApp.reloadModules(function(err) {
        if (err) {return done(err);}
        assert(sailsApp._actions['toplevel.fnaction'], 'Expected to find a `toplevel.fnaction` action, but didn\'t.');
        assert(sailsApp._actions['toplevel.machineaction'], 'Expected to find a `toplevel.machineaction` action, but didn\'t.');
        assert(sailsApp._actions['nested.standalone-action'], 'Expected to find a `nested.standalone-action` action, but didn\'t.');
        assert.equal(sails.hooks.myHook.stuff, 'bar');
        return done();
      });
    });

    it('should skip modules for hooks listed in `hooksToSkip`', function(done) {
      userHookStuff = 'zzz';
      sailsApp.reloadModules({hooksToSkip: ['myHook']}, function(err) {
        if (err) {return done(err);}
        assert.equal(sails.hooks.myHook.stuff, 'bar');
        return done();
      });
    });

  });

});
