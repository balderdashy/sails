/**
 * Module dependencies
 */

var nodepath = require('path');
var CaptainsLog = require('captains-log');

// Once per process:
// Build logger using best-available information
// when this module is initially required.
var rconf = require('../lib/app/configuration/rc')();
var log = CaptainsLog(rconf.log);


/**
 * Warnings
 */
module.exports = {

  incompatibleLocalSails: function(requiredVersion, localVersion) {
    log.warn('Trying to lift app using a local copy of `sails`');
    log.warn('(located in ' + nodepath.resolve(process.cwd(), 'node_modules/sails') + ')');
    log.warn();
    log.warn('But the package.json in the current directory indicates a dependency');
    log.warn('on Sails `' + requiredVersion + '`, and the locally installed Sails is `' + localVersion + '`!');
    log.warn();
    log.warn('If you run into compatibility issues, try installing ' + requiredVersion + ' locally:');
    log.warn('    $ npm install sails@' + requiredVersion);
    log.warn();
    log.blank();
  },



  // Verbose-only warnings:

  noPackageJSON: function() {
    log.warn('Cannot read package.json in the current directory (' + process.cwd() + ')');
    log.warn('Are you sure this is a Sails app?');
    log.warn();
  },

  notSailsApp: function() {
    log.warn('The package.json in the current directory does not list Sails as a dependency...');
    log.warn('Are you sure `' + process.cwd() + '` is a Sails app?');
    log.warn();
  },

  badLocalDependency: function(pathToLocalSails, requiredVersion) {
    log.warn(
      'The local Sails dependency installed at `' + pathToLocalSails + '` ' +
      'has a corrupted, missing, or un-parsable package.json file.'
    );
    log.warn('You may consider running:');
    log.warn('rm -rf ' + pathToLocalSails + ' && npm install sails@' + requiredVersion);
    log.warn();
  }
};
