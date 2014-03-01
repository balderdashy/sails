#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, Sails = require('../lib/app')
	, _ = require('lodash')
	, rconf = require('../lib/configuration/rc')
	, captains = require('captains-log')
	, path  = require('path');



/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 */

module.exports = function () {

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
	var localSailsPath = path.resolve(appPath, 'node_modules/sails');
	if ( Sails.isLocalSailsValid(localSailsPath, appPath) ) {
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
