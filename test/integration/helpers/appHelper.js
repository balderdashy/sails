/**
 * Module dependencies
 */

var path = require('path');
var child_process = require('child_process');
var exec = child_process.exec;
var fs = require('fs-extra');
var _ = require('@sailshq/lodash');
var SocketIOClient = require('socket.io-client');
delete require.cache[require.resolve('socket.io-client')];
var SailsIOClient = require('sails.io.js');
var Sails = require('../../../lib/app');





// Build a Sails socket client instance.
//
// (Of course, this runs as soon as this file is first required.
//  But it's OK because we don't actually connect except in the
//  functions below.)
var io = SailsIOClient(SocketIOClient);
io.sails.environment = 'production';
io.sails.autoConnect = false;



// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || path.existsSync;
// ^ probably not necessary anymore, this is only relevant for pre-Node-0.8
// (or maybe it was Node 0.8, can't remember). Anyways, it was back when
// `existsSync()` lived in the `path` lib.






module.exports = {



  /**
   * Spin up a child process and use the `sails` CLI to create a namespaced
   * test app. If no appName is given use: 'testApp'.
   *
   * It copies all the files in the fixtures folder into their
   * respective place in the test app so you don't need to worry
   * about setting up the fixtures.
   */

  build: function(appName, done) {

    // `appName` is optional.
    if (_.isFunction(appName)) {
      done = appName;
      appName = 'testApp';
    }

    // But `done` callback is required.
    if (!_.isFunction(done)) {
      throw new Error('When using the appHelper\'s `build()` method, a callback argument is required');
    }


    var pathToLocalSailsCLI = path.resolve('./bin/sails.js');


    // Cleanup old test fixtures
    if (fs.existsSync(appName)) {
      fs.removeSync(path.resolve('./', appName));
    }

    // Create an empty directory for the test app.
    var appDirPath = path.resolve('./', appName);
    fs.mkdirSync(appDirPath);

    //
    process.chdir(appName);
    child_process.exec('node ' + pathToLocalSailsCLI + ' new --fast --traditional --without=lodash,async', function(err) {
      if (err) {
        return done(err);
      }
      // Symlink dependencies
      module.exports.linkDeps('.');
      // Copy test fixtures to the test app.
      fs.copy('../test/integration/fixtures/sampleapp', './', done);
    });
  },



  /**
   * Remove a test app (clean up files on disk.)
   *
   * @sync (because it sync filesystem methods)
   */
  teardown: function(appName) {
    appName = appName ? appName : 'testApp';

    var dir = path.resolve('./', appName);
    if (fs.existsSync(dir)) {
      fs.removeSync(dir);
    }
  },





  liftQuiet: function(options, callback) {

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }

    options = options || {};
    _.defaults(options, {
      log: {
        level: 'silent'
      }
    });

    return module.exports.lift(options, callback);

  },



  lift: function(options, callback) {

    // Clear NODE_ENV to avoid unintended consequences.
    delete process.env.NODE_ENV;

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }

    options = options || {};
    _.defaults(options, {
      port: 1342,
      environment: process.env.TEST_ENV,
      globals: false
    });
    options.hooks = options.hooks || {};
    options.hooks.grunt = options.hooks.grunt || false;

    Sails().lift(options, function(err, sails) {
      if (err) {
        return callback(err);
      }
      return callback(null, sails);
    });

  },

  load: function(options, callback) {

    // Clear NODE_ENV to avoid unintended consequences.
    delete process.env.NODE_ENV;

    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }

    options = options || {};
    _.defaults(options, {
      port: 1342,
      environment: process.env.TEST_ENV
    });
    options.hooks = options.hooks || {};
    options.hooks.grunt = options.hooks.grunt || false;

    Sails().load(options, function(err, sails) {
      if (err) {
        return callback(err);
      }
      return callback(null, sails);
    });

  },


  buildAndLift: function(appName, options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    module.exports.build(appName, function(err) {
      if (err) {
        return callback(err);
      }
      module.exports.lift(options, callback);
    });
  },

  liftWithTwoSockets: function(options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    module.exports.lift(options, function(err, sails) {
      if (err) {
        return callback(err);
      }

      var socket1 = io.sails.connect('http://localhost:1342', {
        multiplex: false,
      });
      socket1.on('connect', function() {
        var socket2 = io.sails.connect('http://localhost:1342', {
          multiplex: false,
        });
        socket2.on('connect', function() {
          return callback(null, sails, socket1, socket2);
        });
      });
    });
  },

  buildAndLiftWithTwoSockets: function(appName, options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = null;
    }
    module.exports.build(appName, function(err) {
      if (err) {
        return callback(err);
      }
      module.exports.liftWithTwoSockets(options, callback);
    });
  },

  linkDeps: function(appPath) {

    // Get the given app's package.json (defaulting to an empty dictionary).
    var packageJson;
    try {
      packageJson = require(path.resolve(appPath, 'package.json'));
    } catch (e) {
      packageJson = {};
    }

    var deps = ['sails-hook-orm', 'sails-hook-sockets'];
    _.each(deps, function(dep) {
      // Create a symlink
      fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', '..', 'node_modules', dep), path.resolve(appPath, 'node_modules', dep));
      // Add a entry into the package.json dependencies
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies[dep] = '0.0.0';
    });

    // Output the update package.json
    fs.writeFileSync(path.resolve(appPath, 'package.json'), JSON.stringify(packageJson));
  },

  linkLodash: function(appPath) {
    fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', '..', 'node_modules', '@sailshq', 'lodash'), path.resolve(appPath, 'node_modules', '@sailshq', 'lodash'));
  },


  linkAsync: function(appPath) {
    fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', '..', 'node_modules', 'async'), path.resolve(appPath, 'node_modules', 'async'));
  },


  linkSails: function(appPath) {
    fs.ensureSymlinkSync(path.resolve(__dirname, '..', '..', '..'), path.resolve(appPath, 'node_modules', 'sails'));
  },

};






