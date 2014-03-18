/**
 * Module dependencies
 */
var _			= require('lodash')
	, fs			= require('fs')
	, Err			= require('../../errors')
	, log     = require('captains-log')()
	, util		= require('sails-util');



/**
 * Check if the specified installation of Sails is valid for the specified project.
 *
 * @param sailsPath
 * @param appPath
 */

module.exports = function isLocalSailsValid ( sailsPath, appPath ) {

	// Has no package.json file
	if ( ! fs.existsSync( appPath + '/package.json') ) {
		Err.warn.noPackageJSON();
	}

	// Load this app's package.json and dependencies
	var appPackageJSON = util.getPackageSync(appPath);
	var appDependencies = appPackageJSON.dependencies;


	// Package.json exists, but doesn't list Sails as a dependency
	if ( !(appDependencies && appDependencies.sails) ) {
		Err.warn.notSailsApp();
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
	if ( expectsGitVersion ) {
		log.blank();
		log.debug('NOTE:');
		log.debug('This app depends on an unreleased version of Sails:');
		log.debug(requiredSailsVersion);
		log.blank();
	}

	// Ignore `latest` and `beta` (kind of like how we handle specified git:// deps)
	var expectsLatest = requiredSailsVersion === 'latest';
	if ( expectsLatest ) {
		// ...
	}
	var expectsBeta = requiredSailsVersion === 'beta';
	if ( expectsBeta ) {
		// ...
	}

	// If you're using a `~` or `^`-prefixed Sails dependency, ignore
	// that first character.
	// 
	// NOTE:
	// This means a warning message is shown to users
	// when they're only a patch version off.
	// TODO: get feedback on this-- it's an installation/deployment
	// consideration.
	// 
	requiredSailsVersion = requiredSailsVersion.replace(/^(~|^)/, '');
	
	// Error out if it has the wrong version in its package.json
	if ( !expectsLatest && !expectsBeta && !expectsGitVersion &&
				requiredSailsVersion !== sailsPackageJSON.version) {
		Err.warn.incompatibleLocalSails(requiredSailsVersion, sailsPackageJSON.version);
	}

	// If we made it this far, the target Sails installation must be OK
	return true;
};


