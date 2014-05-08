#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('lodash');
var captains = require('captains-log');
var package = require('../package.json');
var rconf = require('../lib/app/configuration/rc');
var Sails = require('../lib/app');



/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 */

module.exports = function() {

  // console.time('cli_lift');
  // console.time('cli_prelift');

  // console.time('cli_rc');
  var log = captains(rconf.log);
  // console.timeEnd('cli_rc');

  console.log();
  require('colors');
  log.info('Starting app...'.grey);
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
    if (err) { sails ? sails.log.error(err) : log.error(err); process.exit(1); }
    // try {console.timeEnd('cli_lift');}catch(e){}
  }
};




