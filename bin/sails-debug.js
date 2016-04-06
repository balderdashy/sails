#!/usr/bin/env node


/**
 * Module dependencies
 */

var path = require('path');
var Womb = require('child_process');
var CaptainsLog = require('captains-log');
var chalk = require('chalk');
var Sails = require('../lib/app');


/**
 * `sails debug`
 *
 * Attach the Node debugger and lift a Sails app.
 * You can then use Node inspector to debug your app as it runs.
 *
 * @stability 2
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-debug
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

    log.info(chalk.grey('( to exit, type ' + '<CTRL>+<C>' + ' )'));
    console.log();

    // Spin up child process for Sails
    Womb.spawn('node', ['--debug', pathToSails, 'lift'], {
      stdio: 'inherit'
    });
  });

};
