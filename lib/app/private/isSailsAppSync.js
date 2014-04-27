/**
 * Module dependencies
 */

var fs = require('fs'),
  path = require('path'),
  sailsutil = require('sails-util');



/**
 * Check if the specified appPath contains something that looks like a Sails app.
 *
 * @param {String} appPath
 */

module.exports = function isSailsAppSync(appPath) {

  // Has no package.json file
  if (!fs.existsSync(path.join(appPath, 'package.json'))) {
    return false;
  }

  // Package.json exists, but doesn't list Sails as a dependency
  var appPackageJSON = sailsutil.getPackageSync(appPath);
  var appDependencies = appPackageJSON.dependencies;
  if (!(appDependencies && appDependencies.sails)) {
    return false;
  }

  return true;
};
