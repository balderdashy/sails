/**
 * Module dependencies
 */
var _			= require('lodash'),
	argv		= require('optimist').argv,
	fs			= require('fs-extra'),
	Err			= require('../../errors'),
	Logger		= require('../hooks/logger/captains'),
	util		= require('../../util');


// Build logger using command-line config
var log = new Logger(util.getCLIConfig(argv).log);





/**
 * Check if the specified installation of Sails is valid for the specified project.
 * (Also verifies that the project is valid.)
 *
 * @param sailsPath
 * @param appPath
 */
module.exports = function isLocalSailsValid ( sailsPath, appPath ) {

	// Has no package.json file
	if ( ! fs.existsSync( appPath + '/package.json') ) {
		Err.fatal.noPackageJSON();
		return;
	}

	// Load this app's package.json and dependencies
	var appPackageJSON = util.getPackageSync(appPath);
	var appDependencies = appPackageJSON.dependencies;


	// Package.json exists, but doesn't list Sails as a dependency
	if ( !(appDependencies && appDependencies.sails) ) {
		Err.fatal.notSailsApp();
		return;
	}

	// Ensure the target Sails exists
	if ( !fs.existsSync(sailsPath) ) {
		return false;
	}

	// Read the package.json in the local installation of Sails
	sailsPackageJSON = util.getPackageSync(sailsPath);

	// Local Sails has a corrupted package.json
	if ( !sailsPackageJSON ) {
		Err.fatal.badLocalDependency(sailsPath, appDependencies.sails);
		return;
	}

	// Lookup sails dependency requirement in app's package.json
	var requiredSailsVersion = appDependencies.sails;

	// If you're using a `git://` sails dependency, you probably know
	// what you're doing, but we'll let you know just in case.
	var isUsingGit = requiredSailsVersion.match(/^git:\/\/.+/);
	if ( isUsingGit ) {
		console.log();
		log.debug('NOTE:');
		log.debug('This app depends on an unreleased version of Sails:');
		log.debug(requiredSailsVersion);
		console.log();
	}
	
	// Error out if it has the wrong version in its package.json
	// TODO: use npm's native version comparator instead
	if ( !isUsingGit && requiredSailsVersion !== sailsPackageJSON.version) {
		Err.warn.incompatibleLocalSails(requiredSailsVersion, sailsPackageJSON.version);
	}

	// If we made it this far, the target Sails installation must be OK
	return true;
};


