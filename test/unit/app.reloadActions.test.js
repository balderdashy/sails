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

describe('sails.reloadActions ::', function() {

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
        globals: { sails: true, models: false, _: false, async: false, services: false },
        hooks: {
          grunt: false, views: false, blueprints: false, policies: false, pubsub: false, i18n: false,
          myHook: function() {return {initialize: function(cb) {this.registerActions(cb);}, registerActions: function(cb) {sails.registerAction(function(){}, 'custom-action'); return cb();}};}
        },
        log: {level: 'error'}
      }, function(err, _sails) {
        sailsApp = _sails;
        assert(sailsApp._actions['toplevel/fnaction'], 'Expected to find a `toplevel/fnaction` action, but didn\'t.');
        assert(sailsApp._actions['custom-action'], 'Expected to find a `custom-action` action, but didn\'t.');
        assert(!sailsApp._actions['toplevel/machineaction'], 'Didn\'t expect `toplevel/machineaction` action to exist!');
        assert(!sailsApp._actions['nested/standalone-action'], 'Didn\'t expect `nested/standalone-action` action to exist!');
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
      sailsApp.reloadActions(function(err) {
        if (err) {return done(err);}
        assert(sailsApp._actions['toplevel/fnaction'], 'Expected to find a `toplevel/fnaction` action, but didn\'t.');
        assert(sailsApp._actions['toplevel/machineaction'], 'Expected to find a `toplevel/machineaction` action, but didn\'t.');
        assert(sailsApp._actions['nested/standalone-action'], 'Expected to find a `nested/standalone-action` action, but didn\'t.');
        assert(sailsApp._actions['custom-action'], 'Expected to find a `custom-action` action, but didn\'t.');
        return done();
      });
    });

    it('should skip modules for hooks listed in `hooksToSkip`', function(done) {
      sailsApp.reloadActions({hooksToSkip: ['myHook']}, function(err) {
        if (err) {return done(err);}
        assert(!sailsApp._actions['custom-action'], 'Expected to not find a `custom-action` action, but did!');
        return done();
      });
    });

  });

});
