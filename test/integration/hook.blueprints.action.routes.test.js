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

    var curDir, tmpDir, sailsApp;
    var extraSailsConfig = {};

    before(function(done) {
      // Cache the current working directory.
      curDir = process.cwd();
      // Create a temp directory.
      tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      (new Sails()).load(_.merge({
        hooks: {
          grunt: false, views: false, policies: false
        },
        orm: { moduleDefinitions: { adapters: { 'sails-disk': require('sails-disk')} } },
        models: {
          migrate: 'drop',
          schema: true
        },
        blueprints: {
          shortcuts: false,
          rest: false
        },
        log: {level: 'error'},
        controllers: {
          moduleDefinitions: {
            'toplevellegacy/fnaction': function (req, res) { res.send('legacy fn action!'); },
            'toplevellegacy/machineaction': { exits: {success: {example: 'abc123'} }, fn: function (inputs, exits) { exits.success('legacy machine action!'); } },
            'top-level-standalone-fn': function (req, res) { res.send('top level standalone fn!'); },
            'top-level-standalone-machine': { exits: {success: {example: 'abc123'} },  fn: function (inputs, exits) { exits.success('top level standalone machine!'); } },
            'somefolder/someotherfolder/nestedlegacy/fnaction': function (req, res) { res.send('nested legacy fn action!'); },
            'somefolder/someotherfolder/nestedlegacy/machineaction': { exits: {success: {example: 'abc123'} },  fn: function (inputs, exits) { exits.success('nested legacy machine action!'); } },
            'somefolder/someotherfolder/nested-standalone-machine': { exits: {success: {example: 'abc123'} },  fn: function (inputs, exits) { exits.success('nested standalone machine!'); } }
          }
        }

      }, extraSailsConfig), function(err, _sails) {
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

  });

});
