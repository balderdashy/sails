#!/usr/bin/env node


/**
 * Module dependencies
 */

var path = require('path');
var Womb = require('child_process');
var CaptainsLog = require('captains-log');


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
module.exports = function() {
  var log = CaptainsLog();

  console.log();
  log.info('Running console in debug mode...');

  // Check whether node-inspector is running
  Womb.exec('ps', function(error, stdout, stderr) {

    // If not, suggest that they run it
    if (error || stderr || !stdout.toString().match(/node-inspector/)) {
      log.info('You probably want to install / run node-inspector to help with debugging!');
      log.info('https://github.com/node-inspector/node-inspector');
      console.log();
    }

    // Spin up child process for the Sails console
    var pathToConsole = path.resolve(__dirname, './sails.js');
    Womb.spawn('node', ['--debug', pathToConsole, 'console', global.sails_dc_opts], {
      stdio: 'inherit'
    });
  });

};
