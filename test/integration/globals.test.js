/**
 * Test dependencies
 */

var assert = require('assert');
var tmp = require('tmp');
var path = require('path');
var util = require('util');
var _ = require('@sailshq/lodash');
var appHelper = require('./helpers/appHelper');
var Filesystem = require('machinepack-fs');
var MProcess = require('machinepack-process');
var pathToSailsCLI = path.resolve(__dirname, '../../bin/sails.js');

describe('globals :: ', function() {

  var curDir;

  describe('with default settings in an app lifted programmatically with no configuration', function() {

    var result;

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.ensureDir({path: 'node_modules'}).exec(function(err) {
        if (err) {return done(err);}

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink Sails to the new app
        appHelper.linkSails(tmpDir.name);

        MProcess.executeCommand({
          command: util.format('node expose_globals.js'),
        }).exec(function(err, output) {
          if (err) {return done(err);}
          if (output.stderr) {return done(output.stderr);}
          try {
            result = JSON.parse(output.stdout);
          } catch (e) {
            return done(e);
          }
          return done();
        });

      });

    });

    it('should not expose `async` as a global', function() {
      assert.equal(result.async, false);
    });

    it('should not expose `_` as a global', function() {
      assert.equal(result._, false);
    });

    it('should not expose services as globals', function() {
      assert.equal(result.services, false);
    });

    it('should not expose models as globals', function() {
      assert.equal(result.models, false);
    });

    it('should not expose sails as a global', function() {
      assert.equal(result.sails, false);
    });

    after(function() {
      process.chdir(curDir);
    });

  });


  describe('with default settings in an app generated with `sails new`', function() {

    var result;

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      // Get the full path to the directory containing the app
      var pathToTestApp = path.resolve(tmpDir.name, 'testApp');

      // Create a new Sails app w/out npm install.
      MProcess.executeCommand({
        command: util.format('node %s new %s --fast --traditional', pathToSailsCLI, 'testApp'),
      }).exec(function(err) {
        if (err) {return done(err);}

        // Switch to the app directory.
        process.chdir(pathToTestApp);

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink dependencies to the new app
        appHelper.linkDeps(pathToTestApp);

        // Symlink Sails to the new app
        appHelper.linkSails(pathToTestApp);

        // Symlink Sails to the new app
        appHelper.linkLodash(pathToTestApp);

        // Symlink Sails to the new app
        appHelper.linkAsync(pathToTestApp);

        MProcess.executeCommand({
          command: util.format('node expose_globals.js'),
        }).exec(function(err, output) {
          if (err) {return done(err);}
          if (output.stderr) {return done(output.stderr);}
          try {
            result = JSON.parse(output.stdout);
          } catch (e) {
            return done(new Error('Error parsing child process output as JSON. Error details: ' +e.stack+'\nAnd here\'s the raw output that could not be parsed as JSON:\n'+output.stdout));
          }

          return done();
        });

      });

    });

    it('should expose `async` as a global', function() {
      assert(_.isArray(result.async));
      assert(_.contains(result.async, 'auto'));
    });

    it('should expose `_` as a global', function() {
      assert(_.isArray(result._));
      assert(_.contains(result._, 'contains'));
    });

    it('should expose services as globals', function() {
      assert(_.isArray(result.services));
      assert(_.contains(result.services, 'Foo'));
    });

    it('should expose models as globals', function() {
      assert(_.isArray(result.models));
      assert(_.contains(result.models, 'User'));
    });

    it('should expose sails as a global', function() {
      assert.equal(result.sails, true);
    });

    after(function() {
      process.chdir(curDir);
    });

  });


  describe('with custom async/lodash in an app generated with `sails new`', function() {

    var result;

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      // Get the full path to the directory containing the app
      var pathToTestApp = path.resolve(tmpDir.name, 'testApp');

      // Create a new Sails app w/out npm install.
      MProcess.executeCommand({
        command: util.format('node %s new %s --fast --traditional', pathToSailsCLI, 'testApp'),
      }).exec(function(err) {
        if (err) {return done(err);}

        // Switch to the app directory.
        process.chdir(pathToTestApp);

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink dependencies to the new app
        appHelper.linkDeps(pathToTestApp);

        // Symlink Sails to the new app
        appHelper.linkSails(pathToTestApp);

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/@sailshq/lodash/package.json',
          string: '{"name": "lodash", "version": "0.0.0"}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/@sailshq/lodash/index.js',
          string: 'module.exports = {"foo": "bar"}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/async/package.json',
          string: '{"name": "async", "version": "0.0.0"}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/async/index.js',
          string: 'module.exports = {"owl": "hoot"}'
        }).execSync();

        MProcess.executeCommand({
          command: util.format('node expose_globals.js'),
        }).exec(function(err, output) {
          if (err) {return done(err);}
          if (output.stderr) {return done(output.stderr);}
          try {
            result = JSON.parse(output.stdout);
          } catch (e) {
            return done(e);
          }
          return done();
        });

      });

    });

    it('should expose `async` as a global, using the custom async', function() {
      assert(_.isArray(result.async));
      assert(_.contains(result.async, 'owl'));
    });

    it('should expose `_` as a global, using the custom lodash', function() {
      assert(_.isArray(result._));
      assert(_.contains(result._, 'foo'));
    });

    it('should expose services as globals', function() {
      assert(_.isArray(result.services));
      assert(_.contains(result.services, 'Foo'));
    });

    it('should expose models as globals', function() {
      assert(_.isArray(result.models));
      assert(_.contains(result.models, 'User'));
    });

    it('should expose sails as a global', function() {
      assert.equal(result.sails, true);
    });

    after(function() {
      process.chdir(curDir);
    });

  });

  describe('with `_`, `async`, `models`, `sails` and `services` set to `false`', function() {

    var result;

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      // Get the full path to the directory containing the app
      var pathToTestApp = path.resolve(tmpDir.name, 'testApp');

      // Create a new Sails app w/out npm install.
      MProcess.executeCommand({
        command: util.format('node %s new %s --fast --traditional', pathToSailsCLI, 'testApp'),
      }).exec(function(err) {
        if (err) {return done(err);}

        // Switch to the app directory.
        process.chdir(pathToTestApp);

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink dependencies to the new app
        appHelper.linkDeps(pathToTestApp);

        // Symlink Sails to the new app
        appHelper.linkSails(pathToTestApp);

        Filesystem.writeSync({
          force: true,
          destination: 'config/globals.js',
          string: 'module.exports.globals = { _: false, async: false, models: false, sails: false, services: false}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/lodash/package.json',
          string: '{"name": "lodash", "version": "0.0.0"}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/lodash/index.js',
          string: 'module.exports = {"foo": "bar"}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/async/package.json',
          string: '{"name": "async", "version": "0.0.0"}'
        }).execSync();

        Filesystem.writeSync({
          force: true,
          destination: 'node_modules/async/index.js',
          string: 'module.exports = {"owl": "hoot"}'
        }).execSync();

        MProcess.executeCommand({
          command: util.format('node expose_globals.js'),
        }).exec(function(err, output) {
          if (err) {return done(err);}
          if (output.stderr) {return done(output.stderr);}
          try {
            result = JSON.parse(output.stdout);
          } catch (e) {
            return done(e);
          }
          return done();
        });

      });

    });

    it('should not expose `async` as a global', function() {
      assert.equal(result.async, false);
    });

    it('should not expose `_` as a global', function() {
      assert.equal(result._, false);
    });

    it('should not expose services as globals', function() {
      assert.equal(result.services, false);
    });

    it('should not expose models as globals', function() {
      assert.equal(result.models, false);
    });

    it('should not expose sails as a global', function() {
      assert.equal(result.sails, false);
    });

    after(function() {
      process.chdir(curDir);
    });

  });


  describe('with `_` set to `true`', function() {

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.ensureDir({path: 'node_modules'}).exec(function(err) {
        if (err) {return done(err);}

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink Sails to the new app
        appHelper.linkSails(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'config/globals.js',
          string: 'module.exports.globals = { _: true }'
        }).execSync();

        return done();

      });

    });

    it('should fail to lift', function(done) {

      MProcess.executeCommand({
        command: util.format('node expose_globals.js'),
      }).exec(function(err, output) {
        if (output.stderr) {
          if (output.stderr.match('E_BAD_GLOBAL_CONFIG')) {
            return done();
          }
          return done(err);
        }
        return done(new Error('Sails should have failed to lift!'));
      });
    });

    after(function() {
      process.chdir(curDir);
    });

  });

  describe('with `async` set to `true`', function() {

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.ensureDir({path: 'node_modules'}).exec(function(err) {
        if (err) {return done(err);}

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink Sails to the new app
        appHelper.linkSails(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'config/globals.js',
          string: 'module.exports.globals = { async: true }'
        }).execSync();

        return done();

      });

    });

    it('should fail to lift', function(done) {

      MProcess.executeCommand({
        command: util.format('node expose_globals.js'),
      }).exec(function(err, output) {
        if (output.stderr) {
          if (output.stderr.match('E_BAD_GLOBAL_CONFIG')) {
            return done();
          }
          return done(err);
        }
        return done(new Error('Sails should have failed to lift!'));
      });
    });

    after(function() {
      process.chdir(curDir);
    });

  });

  describe('with `models` set to `undefined`', function() {

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.ensureDir({path: 'node_modules'}).exec(function(err) {
        if (err) {return done(err);}

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink Sails to the new app
        appHelper.linkSails(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'config/globals.js',
          string: 'module.exports.globals = { async: false, _: false, sails: false }'
        }).execSync();

        return done();

      });

    });

    it('should fail to lift', function(done) {

      MProcess.executeCommand({
        command: util.format('node expose_globals.js'),
      }).exec(function(err, output) {
        if (output.stderr) {
          if (output.stderr.match('E_BAD_GLOBAL_CONFIG')) {
            return done();
          }
          return done(err);
        }
        return done(new Error('Sails should have failed to lift!'));
      });
    });

    after(function() {
      process.chdir(curDir);
    });

  });

  describe('with `sails` set to `undefined`', function() {

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.ensureDir({path: 'node_modules'}).exec(function(err) {
        if (err) {return done(err);}

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink Sails to the new app
        appHelper.linkSails(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'config/globals.js',
          string: 'module.exports.globals = { async: false, _: false, models: false }'
        }).execSync();

        return done();

      });

    });

    it('should fail to lift', function(done) {

      MProcess.executeCommand({
        command: util.format('node expose_globals.js'),
      }).exec(function(err, output) {
        if (output.stderr) {
          if (output.stderr.match('E_BAD_GLOBAL_CONFIG')) {
            return done();
          }
          return done(err);
        }
        return done(new Error('Sails should have failed to lift!'));
      });
    });

    after(function() {
      process.chdir(curDir);
    });

  });

  describe('with `sails.config.globals` set to `true`', function() {

    before(function(done) {

      // Cache the current working directory.
      curDir = process.cwd();

      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});

      // Switch to the temp directory.
      process.chdir(tmpDir.name);

      Filesystem.ensureDir({path: 'node_modules'}).exec(function(err) {
        if (err) {return done(err);}

        // Set up some app files (a model, a service and config/models.js with `migrate: 'alter'`)
        setupAppFiles();

        // Symlink Sails to the new app
        appHelper.linkSails(tmpDir.name);

        Filesystem.writeSync({
          force: true,
          destination: 'config/globals.js',
          string: 'module.exports.globals = true'
        }).execSync();

        return done();

      });

    });

    it('should fail to lift', function(done) {

      MProcess.executeCommand({
        command: util.format('node expose_globals.js'),
      }).exec(function(err, output) {
        if (err) { return done(err); }
        if (output.stderr) {
          if (output.stderr.match('E_BAD_GLOBAL_CONFIG')) {
            return done();
          }
          return done(new Error(output.stderr));
        }
        return done(new Error('Sails should have failed to lift!'));
      });
    });

    after(function() {
      process.chdir(curDir);
    });

  });


});

function setupAppFiles() {

  Filesystem.writeSync({
    force: true,
    destination: 'api/models/User.js',
    string: 'module.exports = { attributes: { name: \'string\' } };'
  }).execSync();

  Filesystem.writeSync({
    force: true,
    destination: 'api/services/Foo.js',
    string: 'module.exports = function TheFooService() {};'
  }).execSync();

  Filesystem.writeSync({
    force: true,
    destination: 'config/models.js',
    string: 'module.exports.models = {migrate: \'alter\', attributes: {id: { type: \'number\', autoIncrement: true}}};'
  }).execSync();


  Filesystem.writeSync({
    force: true,
    destination: 'expose_globals.js',
    string: '(' + (function logGlobalVarsIIFERiddle() {
      /* eslint-disable no-undef */
      var Sails = require('sails');
      Sails.load({log: {level: 'silent'}}, function(err, sailsApp) {
        if (err) {console.error(err); return;}
        console.log(JSON.stringify({
          async:  typeof async !== 'undefined' && Object.keys(async),
          _: typeof _ !== 'undefined' && Object.keys(_),
          sails: typeof sails !== 'undefined' && sails.constructor.name === 'Sails',
          models: typeof sailsApp.models !== 'undefined' && Object.keys(sailsApp.models).reduce(function(memo, key) {if (global[sailsApp.models[key].globalId]){memo.push(sailsApp.models[key].globalId);}return memo;}, []),
          services: typeof sailsApp.services !== 'undefined' && Object.keys(sailsApp.services).reduce(function(memo, key) {if (global[sailsApp.services[key].globalId]){memo.push(sailsApp.services[key].globalId);}return memo;}, [])
        }));
        sailsApp.lower();
      });
      /* eslint-enable no-undef */
    }).toString()  + ')();'
  }).execSync();

}
