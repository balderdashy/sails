/**
 * Module dependencies
 */

var path = require('path');
var Womb = require('child_process');
var CaptainsLog = require('captains-log');
var chalk = require('chalk');
var Sails = require('../lib/app');


/**
 * `sails inspect`
 *
 * Attach the Node inspector and lift a Sails app.
 * You can then use Node inspector to debug your app as it runs.
 *
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
  log.info('Running app in inspect mode...');
  if (process.version[1] >= 8) {
    log.info('In Google Chrome, go to chrome://inspect for interactive debugging.');
    log.info('For other options, see the link below.');
  }

  log.info(chalk.grey('( to exit, type ' + '<CTRL>+<C>' + ' )'));
  console.log();

  // Spin up child process for Sails
  Womb.spawn('node', ['--inspect', pathToSails, 'lift'].concat(extraArgs), {
    stdio: 'inherit'
  });

};
