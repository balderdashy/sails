#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app');
var path = require('path');
var Womb = require('child_process');
var CaptainsLog = require('captains-log');
var Fs = require('fs');

/*

# This is here for backwards compatibility.
node --debug `which sails` $@
*/


module.exports = function() {
  var log = CaptainsLog();

  // Use the app's local Sails in `node_modules` if one exists
  // But first make sure it'll work...
  var appPath = process.cwd();
  var pathToSails = path.resolve(appPath, '/node_modules/sails');
  if (!Sails.isLocalSailsValid(pathToSails, appPath)) {
    // otherwise, use the currently-running instance of Sails
    pathToSails = path.resolve(__dirname, './sails.js');
  }

  // If NodeInspector is available, use it
  var pathToInspector = path.join(appPath, '/node_modules/node-inspector');
  if (Fs.existsSync(pathToInspector)) {
    console.log(Sails.port);

    log.info('Node Inspector available. Starting it.');
    var inspector = Womb.spawn('./node-inspector', [], {
      cwd: path.join(appPath, '/node_modules/.bin')
    });
    inspector.stdout.on('data', function (data) {
      log.info(data.toString());
    });
    inspector.stderr.on('err', function (err) {
      log.error(data.toString());
    });
  } else {

    console.log();
    log.info('Running node-inspector on this app...');
    log.info('If you don\'t know what to do next, type `help`');
    log.info('Or check out the docs:');
    log.info('http://nodejs.org/api/debugger.html');
    console.log();
  }

  log.info(('( to exit, type ' + '<CTRL>+<C>' + ' )').grey);
  console.log();

  // Spin up child process for Sails
  Womb.spawn('node', ['--debug', pathToSails, 'lift'], {
    stdio: 'inherit'
  });
};
