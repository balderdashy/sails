/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var semver = require('semver');
var CaptainsLog = require('captains-log');
var Err = require('../../../errors');


// FUTURE: change the name of this to `isLocalSailsValidSync()`

/**
 * Check if the specified installation of Sails is valid for the specified project.
 *
 * @param sailsPath
 * @param appPath
 */

module.exports = function isLocalSailsValid(sailsPath, appPath) {

  var sails = this;

  var appPackageJSON;
  var appDependencies;

  // Has no package.json file
  if (!fs.existsSync(appPath + '/package.json')) {
    Err.warn.noPackageJSON();
  }
  else {
    // Load this app's package.json and dependencies
    try {
      appPackageJSON = JSON.parse(fs.readFileSync(path.resolve(appPath, 'package.json'), 'utf8'));
    } catch (unusedErr) {
      Err.warn.notSailsApp();
      return;
    }

    appDependencies = appPackageJSON.dependencies;


    // Package.json exists, but doesn't list Sails as a dependency
    if (!(appDependencies && appDependencies.sails)) {
      Err.warn.notSailsApp();
      return;
    }

  }

  // Ensure the target Sails exists
  if (!fs.existsSync(sailsPath)) {
    return false;
  }

  // Read the package.json in the local installation of Sails
  var sailsPackageJSON;
  try {
    sailsPackageJSON = JSON.parse(fs.readFileSync(path.resolve(sailsPath, 'package.json'), 'utf8'));
  } catch (unusedErr) {
    // Local Sails has a missing or corrupted package.json
    Err.warn.badLocalDependency(sailsPath, appDependencies.sails);
    return;
  }

  // Lookup sails dependency requirement in app's package.json
  var requiredSailsVersion = appDependencies.sails;

  // If you're using a `git://` sails dependency, you probably know
  // what you're doing, but we'll let you know just in case.
  var expectsGitVersion = requiredSailsVersion.match(/^git:\/\/.+/);
  // FUTURE: expand this to check the various other permutations
  // of extremely loose SVRs (e.g. Github dependencies, `*`, `>=0.0.0`, etc.)
  if (expectsGitVersion) {
    var log = sails.log ? sails.log : CaptainsLog();

    log.blank();
    log.debug('NOTE:');
    log.debug('This app depends on an unreleased version of Sails:');
    log.debug(requiredSailsVersion);
    log.blank();
  }

  // Ignore `latest`, `beta` and `edge`
  // (kind of like how we handle specified git:// deps)
  var expectsLatest = requiredSailsVersion === 'latest';
  // if (expectsLatest) {
  //   // FUTURE: potentially log something here (need to test if it's annoying or not...)
  // }
  var expectsBeta = requiredSailsVersion === 'beta';
  // if (expectsBeta) {
  //   // FUTURE: potentially log something here (need to test if it's annoying or not...)
  // }
  var expectsEdge = requiredSailsVersion === 'edge';
  // if (expectsEdge) {
  //   // FUTURE: potentially log something here (need to test if it's annoying or not...)
  // }

  // Error out if it has the wrong version in its package.json
  if (!expectsLatest && !expectsBeta && !expectsEdge && !expectsGitVersion) {

    // Use semver for version comparison
    if (!semver.satisfies(sailsPackageJSON.version, requiredSailsVersion)) {
      Err.warn.incompatibleLocalSails(requiredSailsVersion, sailsPackageJSON.version);
    }
  }

  // If we made it this far, the target Sails installation must be OK
  return true;
};
