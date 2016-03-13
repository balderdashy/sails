/**
 * Module dependencies
 */

var path = require('path');
var child_process = require('child_process');
var exec = child_process.exec;
var fs = require('fs-extra');
var wrench = require('wrench');
var _ = require('lodash');
var SocketIOClient = require('socket.io-client');
var SailsIOClient = require('./sails.io.js');
var Sails = require('../../../lib/app');

// Build a Sails socket client instance.
var io = SailsIOClient(SocketIOClient);
io.sails.environment = 'production';
io.sails.autoConnect = false;

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || path.existsSync;
// ^ probably not necessary anymore, I think this was back pre-Node-0.8


/**
 * Spin up a child process and use the `sails` CLI to create a namespaced
 * test app. If no appName is given use: 'testApp'.
 *
 * It copies all the files in the fixtures folder into their
 * respective place in the test app so you don't need to worry
 * about setting up the fixtures.
 */

module.exports.build = function(appName, done) {

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
    wrench.rmdirSyncRecursive(path.resolve('./', appName));
  }
  // TODO: remove this (^) and instead always clean up at the end.

  // Create an empty directory for the test app.
  var appDirPath = path.resolve('./', appName);
  fs.mkdirSync(appDirPath);

  //
  process.chdir(appName);
  child_process.exec('node ' + pathToLocalSailsCLI + ' new', function(err) {
    if (err) {
      return done(err);
    }

    // Copy test fixtures to the test app.
    ////////////////////////////////////////////////////////////////////////////////////
    // TODO: replace all of this w/ one line via `fsx.copy()`.
    var fixtures = wrench.readdirSyncRecursive('../test/integration/fixtures/sampleapp');
    if (fixtures.length === 0) {
      return done(new Error('Fixtures are missing.'));
    }
    fixtures.forEach(function _eachFixtureFile(file) {
      var filePath = path.resolve('../test/integration/fixtures/sampleapp', file);

      // Check if file is a directory
      var stat = fs.statSync(filePath);

      // Ignore directories
      if (stat.isDirectory()) {
        return;
      }

      // Copy file to test app.
      var data = fs.readFileSync(filePath);

      // Create file and any missing parent directories in its path
      fs.createFileSync(path.resolve(file), data);
      fs.writeFileSync(path.resolve(file), data);
    });
    ////////////////////////////////////////////////////////////////////////////////////

    return done();
  });
};



/**
 * Remove a test app
 *
 * @sync (because it sync filesystem methods)
 */
module.exports.teardown = function(appName) {
  appName = appName ? appName : 'testApp';
  var dir = path.resolve('./', appName);
  if (fs.existsSync(dir)) {
    wrench.rmdirSyncRecursive(dir);
  }
};

module.exports.liftQuiet = function(options, callback) {

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

};


module.exports.lift = function(options, callback) {

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

  Sails().lift(options, function(err, sails) {
    if (err) {
      return callback(err);
    }
    return callback(null, sails);
  });

};

module.exports.buildAndLift = function(appName, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = null;
  }
  module.exports.build(appName, function() {
    module.exports.lift(options, callback);
  });
};

module.exports.liftWithTwoSockets = function(options, callback) {
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
};

module.exports.buildAndLiftWithTwoSockets = function(appName, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = null;
  }
  module.exports.build(appName, function() {
    module.exports.liftWithTwoSockets(options, callback);
  });
};
