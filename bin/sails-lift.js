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

  var log = captains(rconf.log);

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
    require(localSailsPath).lift(scope);
    return;
  }

  // Otherwise, if no workable local Sails exists, run the app
  // using the currently running version of Sails.  This is
  // probably always the global install.
  var globalSails = Sails();
  globalSails.lift(scope);
  return;
};
