#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app');
var path = require('path');
var Womb = require('child_process');
var CaptainsLog = require('captains-log');


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

  console.log();
  log.info('Running app in debug mode...');

  // Check whether node-inspector is running
  Womb.exec('ps', function(error, stdout, stderr) {

    // If not, suggest that they run it
    if (error || stderr || !stdout.toString().match(/node-inspector/)) {
      log.info('You probably want to install / run node-inspector to help with debugging!');
      log.info('https://github.com/node-inspector/node-inspector');
      console.log();
    }

    log.info(('( to exit, type ' + '<CTRL>+<C>' + ' )').grey);
    console.log();

    // Spin up child process for Sails
    Womb.spawn('node', ['--debug', pathToSails, 'lift'], {
      stdio: 'inherit'
    });
  });

};
