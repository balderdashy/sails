/**
 * Module dependencies
 */

var fs = require('fs');
var CaptainsLog = require('captains-log');
var sailsutil = require('sails-util');
var semver = require('semver');
var Err = require('../../../errors');



/**
 * Check if the specified installation of Sails is valid for the specified project.
 *
 * @param sailsPath
 * @param appPath
 */

module.exports = function isLocalSailsValid(sailsPath, appPath) {

  var sails = this;

  // Has no package.json file
  if (!fs.existsSync(appPath + '/package.json')) {
    Err.warn.noPackageJSON();
  }

  // Load this app's package.json and dependencies
  var appPackageJSON = sailsutil.getPackageSync(appPath);
  var appDependencies = appPackageJSON.dependencies;


  // Package.json exists, but doesn't list Sails as a dependency
  if (!(appDependencies && appDependencies.sails)) {
    Err.warn.notSailsApp();
    return;
  }

  // Ensure the target Sails exists
  if (!fs.existsSync(sailsPath)) {
    return false;
  }

  // Read the package.json in the local installation of Sails
  var sailsPackageJSON = sailsutil.getPackageSync(sailsPath);

  // Local Sails has a corrupted package.json
  if (!sailsPackageJSON) {
    Err.warn.badLocalDependency(sailsPath, appDependencies.sails);
    return;
  }


  // Lookup sails dependency requirement in app's package.json
  var requiredSailsVersion = appDependencies.sails;

  //
  // TODO: use npm's built-in version comparator instead of taking care of
  // all these edge cases:
  //

  // If you're using a `git://` sails dependency, you probably know
  // what you're doing, but we'll let you know just in case.
  var expectsGitVersion = requiredSailsVersion.match(/^git:\/\/.+/);
  if (expectsGitVersion) {
    var log = sails.log ? sails.log : CaptainsLog();

    log.blank();
    log.debug('NOTE:');
    log.debug('This app depends on an unreleased version of Sails:');
    log.debug(requiredSailsVersion);
    log.blank();
  }

  // Ignore `latest` and `beta` (kind of like how we handle specified git:// deps)
  var expectsLatest = requiredSailsVersion === 'latest';
  if (expectsLatest) {
    // ...
  }
  var expectsBeta = requiredSailsVersion === 'beta';
  if (expectsBeta) {
    // ...
  }

  // Error out if it has the wrong version in its package.json
  if (!expectsLatest && !expectsBeta && !expectsGitVersion) {

    // Use semver for version comparison
    if (!semver.satisfies(sailsPackageJSON.version, requiredSailsVersion)) {
      Err.warn.incompatibleLocalSails(requiredSailsVersion, sailsPackageJSON.version);
    }
  }

  // If we made it this far, the target Sails installation must be OK
  return true;
};
