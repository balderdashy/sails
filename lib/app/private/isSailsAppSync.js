/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');


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
  var appPackageJSON;
  try {
    appPackageJSON = JSON.parse(fs.readFileSync(path.resolve(appPath, 'package.json'), 'utf8'));
  } catch (unusedErr) {
    return false;
  }
  var appDependencies = appPackageJSON.dependencies;
  if (!(appDependencies && appDependencies.sails)) {
    return false;
  }

  return true;
};
