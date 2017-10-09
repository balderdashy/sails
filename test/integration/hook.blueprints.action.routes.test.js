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

describe('blueprints :: ', function() {

  describe('actions routes :: ', function() {

    describe('when turned on :: ', function() {

      var curDir, tmpDir, sailsApp;

      before(function(done) {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);

        (new Sails()).load({
          hooks: {
            grunt: false, views: false, policies: false, pubsub: false, i18n: false
          },
          models: {
            migrate: 'drop',
            schema: true
          },
          blueprints: {
            actions: true,
            shortcuts: false,
            rest: false
          },
          log: {level: 'error'},
          controllers: {
            moduleDefinitions: {
              'toplevellegacy/fnaction': function (req, res) { res.send('legacy fn action!'); },
              'toplevellegacy/machineaction': { exits: {success: {outputExample: 'abc123'} }, fn: function (inputs, exits) { exits.success('legacy machine action!'); } },
              'top-level-standalone-fn': function (req, res) { res.send('top level standalone fn!'); },
              'top-level-standalone-machine': { exits: {success: {outputExample: 'abc123'} },  fn: function (inputs, exits) { exits.success('top level standalone machine!'); } },
              'somefolder/someotherfolder/nestedlegacy/fnaction': function (req, res) { res.send('nested legacy fn action!'); },
              'somefolder/someotherfolder/nestedlegacy/machineaction': { exits: {success: {outputExample: 'abc123'} },  fn: function (inputs, exits) { exits.success('nested legacy machine action!'); } },
              'somefolder/someotherfolder/nested-standalone-machine': { exits: {success: {outputExample: 'abc123'} },  fn: function (inputs, exits) { exits.success('nested standalone machine!'); } }
            }
          }

        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      after(function(done) {
        sailsApp.lower(function() {
          process.chdir(curDir);
          return done();
        });
      });

      it('should bind a route to \'ALL /toplevellegacy/fnaction\'', function(done) {
        sailsApp.request('POST /toplevellegacy/fnaction', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'legacy fn action!');
          sailsApp.request('GET /toplevellegacy/fnaction', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'legacy fn action!');
            done();
          });
        });
      });

      it('should bind a route to \'ALL /toplevellegacy/machineaction\'', function(done) {
        sailsApp.request('POST /toplevellegacy/machineaction', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'legacy machine action!');
          sailsApp.request('GET /toplevellegacy/machineaction', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'legacy machine action!');
            done();
          });
        });
      });

      it('should bind a route to \'ALL /top-level-standalone-fn\'', function(done) {
        sailsApp.request('POST /top-level-standalone-fn', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'top level standalone fn!');
          sailsApp.request('GET /top-level-standalone-fn', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'top level standalone fn!');
            done();
          });
        });
      });

      it('should bind a route to \'ALL /top-level-standalone-machine\'', function(done) {
        sailsApp.request('POST /top-level-standalone-machine', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'top level standalone machine!');
          sailsApp.request('GET /top-level-standalone-machine', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'top level standalone machine!');
            done();
          });
        });
      });

      it('should bind a route to \'ALL /somefolder/someotherfolder/nestedlegacy/fnaction\'', function(done) {
        sailsApp.request('POST /somefolder/someotherfolder/nestedlegacy/fnaction', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'nested legacy fn action!');
          sailsApp.request('GET /somefolder/someotherfolder/nestedlegacy/fnaction', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'nested legacy fn action!');
            done();
          });
        });
      });

      it('should bind a route to \'ALL /somefolder/someotherfolder/nestedlegacy/machineaction\'', function(done) {
        sailsApp.request('POST /somefolder/someotherfolder/nestedlegacy/machineaction', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'nested legacy machine action!');
          sailsApp.request('GET /somefolder/someotherfolder/nestedlegacy/machineaction', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'nested legacy machine action!');
            done();
          });
        });
      });

      it('should bind a route to \'ALL /somefolder/someotherfolder/nested-standalone-machine\'', function(done) {
        sailsApp.request('POST /somefolder/someotherfolder/nested-standalone-machine', {}, function (err, resp, data) {
          assert(!err, err);
          assert.deepEqual(data, 'nested standalone machine!');
          sailsApp.request('GET /somefolder/someotherfolder/nested-standalone-machine', {}, function (err, resp, data) {
            assert(!err, err);
            assert.deepEqual(data, 'nested standalone machine!');
            done();
          });
        });
      });
    }); // </ describe('when turned on :: ', ... >

    describe('when turned off globally', function() {

      var curDir, tmpDir, sailsApp;

      before(function(done) {
        // Cache the current working directory.
        curDir = process.cwd();
        // Create a temp directory.
        tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
        // Switch to the temp directory.
        process.chdir(tmpDir.name);

        (new Sails()).load({
          hooks: {
            grunt: false, views: false, policies: false, pubsub: false, i18n: false
          },
          models: {
            migrate: 'drop',
            schema: true
          },
          blueprints: {
            actions: false,
            shortcuts: false,
            rest: false
          },
          log: {level: 'error'},
          controllers: {
            moduleDefinitions: {
              'toplevellegacy/fnaction': function (req, res) { res.send('legacy fn action!'); },
              'toplevellegacy/machineaction': { exits: {success: {outputExample: 'abc123'} }, fn: function (inputs, exits) { exits.success('legacy machine action!'); } },
              'top-level-standalone-fn': function (req, res) { res.send('top level standalone fn!'); },
              'top-level-standalone-machine': { exits: {success: {outputExample: 'abc123'} },  fn: function (inputs, exits) { exits.success('top level standalone machine!'); } },
              'somefolder/someotherfolder/nestedlegacy/fnaction': function (req, res) { res.send('nested legacy fn action!'); },
              'somefolder/someotherfolder/nestedlegacy/machineaction': { exits: {success: {outputExample: 'abc123'} },  fn: function (inputs, exits) { exits.success('nested legacy machine action!'); } },
              'somefolder/someotherfolder/nested-standalone-machine': { exits: {success: {outputExample: 'abc123'} },  fn: function (inputs, exits) { exits.success('nested standalone machine!'); } }
            }
          }

        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      after(function(done) {
        sailsApp.lower(function() {
          process.chdir(curDir);
          return done();
        });
      });

      it('should not bind a route to \'ALL /toplevellegacy/fnaction\'', function(done) {
        sailsApp.request('POST /toplevellegacy/fnaction', {}, function (err, resp, data) {
          assert(err);
          assert.equal(err.status, 404);
          return done();
        });
      });

      it('should bind a route to \'ALL /top-level-standalone-fn\'', function(done) {
        sailsApp.request('POST /top-level-standalone-fn', {}, function (err, resp, data) {
          assert(err);
          assert.equal(err.status, 404);
          return done();
        });
      });
    }); // </ describe('when turned off globally :: ', ... >

    describe('when turned off for a single controller', function() {

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
          destination: 'api/controllers/NoController.js',
          string: 'module.exports = { _config: { actions: false }, test: function (req, res) { return res.ok(); } }'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'api/controllers/YesController.js',
          string: 'module.exports = { test: function (req, res) { return res.ok(); } }'
        }).execSync();

        (new Sails()).load({
          hooks: {
            grunt: false, views: false, policies: false, pubsub: false, i18n: false
          },
          models: {
            migrate: 'drop',
            schema: true
          },
          blueprints: {
            actions: true,
            shortcuts: false,
            rest: false
          },
          log: {level: 'error'},

        }, function(err, _sails) {
          if (err) { return done(err); }
          sailsApp = _sails;
          return done();
        });
      });

      after(function(done) {
        sailsApp.lower(function() {
          process.chdir(curDir);
          return done();
        });
      });

      it('should not bind a route to \'ALL /no/test\'', function(done) {
        sailsApp.request('POST /no/test', {}, function (err, resp, data) {
          assert(err);
          assert.equal(err.status, 404);
          return done();
        });
      });

      it('should bind a route to \'ALL /yes/test\'', function(done) {
        sailsApp.request('POST /yes/test', {}, function (err, resp, data) {
          assert(!err, err);
          done();
        });
      });
    }); // </ describe('for a single controller', ... >

  });

});
