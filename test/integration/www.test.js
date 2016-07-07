/**
 * Test dependencies
 */

var assert = require('assert');
var fs = require('fs-extra');
var request = require('request');
var exec = require('child_process').exec;
var path = require('path');
var spawn = require('child_process').spawn;

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

describe('Running sails www', function() {
  var sailsBin = path.resolve('./bin/sails.js');
  var appName = 'testApp';

  before(function() {
    if (fs.existsSync(appName)) {
      fs.removeSync(appName);
    }
  });

  describe('in an empty directory', function() {

    before(function() {
      // Make empty folder and move into it
      fs.mkdirSync('empty');
      process.chdir('empty');
      sailsBin = path.resolve('..', sailsBin);
    });

    // TODO: run tests in here

    after(function() {
      // Delete empty folder and move out of it
      process.chdir('../');
      fs.rmdirSync('empty');
      sailsBin = path.resolve(sailsBin);
    });

  });

  describe('in a sails app directory', function() {

    var sailsChildProc;


    it('should start server without error', function(done) {

      exec('node ' + sailsBin + ' new ' + appName, function(err) {
        if (err) { done(new Error(err)); }

        // Move into app directory
        process.chdir(appName);
        sailsBin = path.resolve('..', sailsBin);

        sailsChildProc = spawn('node', [sailsBin, 'www']);

        // Any output from stderr is considered an error by this test.
        sailsChildProc.stderr.on('data', function(data) {
          return done(data);
        });

        sailsChildProc.stdout.on('data', function(data) {
          var dataString = data + '';
          assert(dataString.indexOf('error') === -1);
          sailsChildProc.stdout.removeAllListeners('data');
          // Move out of app directory
          process.chdir('../');
          sailsChildProc.kill();
          return done();
        });
      });
    });

  });

  describe('with command line arguments', function() {
    afterEach(function(done) {
      sailsChildProc.stderr.removeAllListeners('data');
      process.chdir('../');
      sailsChildProc.kill();
      return done();
    });

    it('--dev should execute grunt build', function(done) {

      // Move into app directory
      process.chdir(appName);

      // Change environment to production in config file
      fs.writeFileSync('config/application.js', 'module.exports = ' + JSON.stringify({
        appName: 'Sails Application',
        port: 1342,
        environment: 'production',
        log: {
          level: 'info'
        }
      }));

      sailsChildProc = spawn('node', [sailsBin, 'www', '--dev']);

      sailsChildProc.stdout.on('data', function(data) {
        var dataString = data + '';
        if (dataString.indexOf('`grunt build`') !== -1) {
          done();
        }
      });
    });


    it('--prod should execute grunt buildProd', function(done) {

      // Move into app directory
      process.chdir(appName);

      // Overrwrite session config file
      // to set session adapter:null ( to prevent warning message from appearing on command line )
      fs.writeFileSync('config/session.js', 'module.exports.session = { adapter: null }');

      sailsChildProc = spawn('node', [sailsBin, 'www', '--prod']);

      sailsChildProc.stdout.on('data', function(data) {
        var dataString = data + '';
        if (dataString.indexOf('`grunt buildProd`') !== -1) {

          done();
        }
      });
    });

  });

  after(function() {
    if (fs.existsSync(appName)) {
      fs.removeSync(appName);
    }
  });
});
