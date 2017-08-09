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
 * `sails debug-console`
 *
 * Attach the Node debugger and enter the interactive console
 * (aka REPL) for the app in our working directory by calling
 * `sails-console.js`. You can then use the console to invoke
 * methods and Node inspector, or your favorite IDE, to debug
 * your app as it runs.
 *
 * @stability 2
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-debug-console
 */
module.exports = function(cmd) {

  var extraArgs = cmd.parent.rawArgs.slice(3);

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
  log.info('Running console in debug mode...');

  log.info(chalk.grey('( to exit, type ' + '<CTRL>+<C>' + ' )'));
  console.log();

  // Spin up child process for the Sails console
  Womb.spawn('node', ['--debug', pathToSails, 'console'].concat(extraArgs), {
    stdio: 'inherit'
  });

};
