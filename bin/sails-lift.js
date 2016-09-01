#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('lodash');
var chalk = require('chalk');
var captains = require('captains-log');
var package = require('../package.json');
var rconf = require('../lib/app/configuration/rc');
var Sails = require('../lib/app');



/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 *
 * @stability 3
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-lift
 */

module.exports = function() {

  // console.time('cli_lift');
  // console.time('cli_prelift');

  // console.time('cli_rc');
  var log = captains(rconf.log);
  // console.timeEnd('cli_rc');

  console.log();
  log.info(chalk.grey('Starting app...'));
  console.log();

  // Build initial scope, mixing-in rc config
  var scope = _.merge({
    rootPath: process.cwd(),
    sailsPackageJSON: package
  }, rconf);

  var appPath = process.cwd();

  // Use the app's local Sails in `node_modules` if it's extant and valid
  var localSailsPath = nodepath.resolve(appPath, 'node_modules/sails');
  if (Sails.isLocalSailsValid(localSailsPath, appPath)) {
    var localSails = require(localSailsPath);
    // console.timeEnd('cli_prelift');

    localSails.lift(scope, afterwards);
    return;
  }

  // Otherwise, if no workable local Sails exists, run the app
  // using the currently running version of Sails.  This is
  // probably always the global install.
  var globalSails = Sails();
  // console.timeEnd('cli_prelift');

  globalSails.lift(scope, afterwards);


  function afterwards (err, sails) {
    if (err) {
      var message = err.stack ? err.stack : err;
      sails ? sails.log.error(message) : log.error(message); process.exit(1);
    }
    // try {console.timeEnd('cli_lift');}catch(e){}
  }
};




