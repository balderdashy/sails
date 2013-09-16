module.exports = function (sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
    utils = require('./utils')(sails),
    fs = utils.fs;



  // Known errors
  var errors = {
    badLocalSails: function (requiredVersion) {
      return 'You may consider reinstalling Sails locally (npm install sails@' + requiredVersion + ').';
    }
  };

  // Read package.json file in specified path
  function getPackage(path) {
    path = require('underscore.string').rtrim(path, '/');
    var packageJson = fs.readFileSync(path + '/package.json', 'utf-8');
    try {
      packageJson = JSON.parse(packageJson);
    } catch (e) {
      return false;
    }
    return packageJson;
  }

  /**
   * Expose method which lifts the given instance of Sails
   */

  return function liftSails(argv) {

    var localSailsPath = sails.config.appPath + '/node_modules/sails';

    // Check project package.json for sails.js dependency version and
    // If no package.json file exists, don't try to start the server
    if (fs.existsSync(sails.config.appPath + '/package.json')) {
      appPackageJson = getPackage(sails.config.appPath);
    } else {
      sails.log.error(
        'Cannot read package.json in the current directory (' + sails.config.appPath + ')\n' +
        'Are you sure this is a Sails app?');
      process.exit(1);
    }

    // If sails dependency unspecified, allow anything, but throw a warning
    var requiredSailsVersion = 0;
    if (!(appPackageJson.dependencies && appPackageJson.dependencies.sails)) {
      sails.log.error(
        'The package.json in the current directory (' + sails.config.appPath + ') ' + 
        'does not list Sails as a dependency...' + '\n' +
        'Are you sure this is a Sails app?'
      );
      process.exit(1);
    } else {
      requiredSailsVersion = appPackageJson.dependencies && appPackageJson.dependencies.sails;
    }

    // check if node_modules/sails exists in current directory
    if (fs.existsSync(localSailsPath)) {

      // check package.json INSIDE local install of Sails
      // Read package.json to detect version
      var localSailsPackage;
      try {
        localSailsPackage = fs.readFileSync(localSailsPath + '/package.json', 'utf-8');
        localSailsPackage = JSON.parse(localSailsPackage);
      } catch (e) {

        // No package.json means local sails means it must be corrupted
        sails.log.error(
          'Locally installed Sails.js dependency (' + localSailsPath + ') ' + 
          'has corrupted, missing, or un-parsable package.json file!'
        );
        sails.log.error(errors.badLocalSails(requiredSailsVersion));
        process.exit(1);
      }


      // Error out if it has the wrong version in its package.json
      // TODO: use npm's native version comparator
      if (requiredSailsVersion !== localSailsPackage.version) {
        sails.log.warn(
          'The package.json in the current directory (' + sails.config.appPath + ') ' + 
          'indicates a dependency on Sails ' + requiredSailsVersion + ', ' +
          'but the locally installed Sails (`./node_modules/sails`) is ' + localSailsPackage.version + '.\n'
        );
        sails.log.warn(errors.badLocalSails(requiredSailsVersion));
      }


      // Run the app using the locally installed version of Sails
      require(sails.config.appPath + '/node_modules/sails/lib').lift(argv);

    }
    
    // Otherwise, run the app using the current Sails
    // (probably the global install, since this is the CLI)
    else require('../lib').lift(argv);
  };

};