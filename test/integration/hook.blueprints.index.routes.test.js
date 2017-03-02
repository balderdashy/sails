/**
 * Test dependencies
 */

var util = require('util');
var assert = require('assert');
var tmp = require('tmp');
var _ = require('@sailshq/lodash');

var appHelper = require('./helpers/appHelper');

var Sails = require('../../lib').constructor;

/**
 * Errors
 */
var Err = {
  badResponse: function(response) {
    return 'Wrong server response!  Response :::\n' + util.inspect(response.body);
  }
};


describe('blueprints :: ', function() {

  var curDir, tmpDir, sailsApp;
  var extraSailsConfig = {};

  before(function(done) {
    // Cache the current working directory.
    curDir = process.cwd();
    // Create a temp directory.
    tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
    // Switch to the temp directory.
    process.chdir(tmpDir.name);
    appHelper.linkDeps(tmpDir.name);

    (new Sails()).load(_.merge({
      hooks: {
        grunt: false, views: false, policies: false, pubsub: false, i18n: false
      },
      orm: {
        moduleDefinitions: {
          models: { 'user': {} }
        }
      },
      models: {
        migrate: 'drop',
        attributes: {
          createdAt: { type: 'number', autoCreatedAt: true, },
          updatedAt: { type: 'number', autoUpdatedAt: true, },
          id: { type: 'number', autoIncrement: true}
        }
      },
      blueprints: {
        shortcuts: false,
        actions: true,
        rest: true,
        index: true
      },
      log: {level: 'error'},
      controllers: {
        moduleDefinitions: {
          'index': function (req, res) { res.send('top-level index!'); },
          'secondlevel/index': function (req, res) { res.send('second-level index!'); },
          'thirdlevel/index': function (req, res) { res.send('third-level index!'); },
          'user/index': function (req, res) { res.send('user index!'); }
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

  it('should bind \'ALL /\' to the `index` action', function(done) {
    sailsApp.request('POST /', {}, function (err, resp, data) {
      assert(!err, err);
      assert.deepEqual(data, 'top-level index!');
      sailsApp.request('GET /', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'top-level index!');
        done();
      });
    });
  });

  it('should bind \'ALL /secondlevel\' to the `secondlevel.index` action', function(done) {
    sailsApp.request('POST /secondlevel', {}, function (err, resp, data) {
      assert(!err, err);
      assert.deepEqual(data, 'second-level index!');
      sailsApp.request('GET /secondlevel', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'second-level index!');
        done();
      });
    });
  });

  it('should bind \'ALL /thirdlevel\' to the `thirdlevel.index` action', function(done) {
    sailsApp.request('POST /thirdlevel', {}, function (err, resp, data) {
      assert(!err, err);
      assert.deepEqual(data, 'third-level index!');
      sailsApp.request('GET /thirdlevel', {}, function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data, 'third-level index!');
        done();
      });
    });
  });

  it('should not override RESTful routes', function(done) {
    sailsApp.request('POST /user', {}, function (err, resp, data) {
      assert(!err, err);
      assert.deepEqual(data.id, 1);
      sailsApp.request('GET /user', function (err, resp, data) {
        assert(!err, err);
        assert.deepEqual(data.length, 1);
        assert.deepEqual(data[0].id, 1);
        done();
      });
    });
  });

});

