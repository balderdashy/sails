/**
 * Module dependencies
 */
var _			= require('lodash'),
	argv		= require('optimist').argv,
	fs			= require('fs'),
	Err			= require('../../errors'),
	Logger		= require('captains-log'),
	util		= require('sails-util');


// Build logger using command-line config
var log = new Logger(util.getCLIConfig(argv).log);





/**
 * Check if the specified appPath contains something that looks like a Sails app.
 * TODO: consider moving to `util`
 * 
 * @param {String} appPath
 */
module.exports = function isSailsAppSync ( appPath ) {

	// Has no package.json file
	if ( !fs.existsSync( appPath + '/package.json') ) {
		return false;
	}

	// Package.json exists, but doesn't list Sails as a dependency
	var appPackageJSON = util.getPackageSync(appPath);
	var appDependencies = appPackageJSON.dependencies;
	if ( !(appDependencies && appDependencies.sails) ) {
		return false;
	}

	return true;
};
