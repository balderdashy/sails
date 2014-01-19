#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, Sails = require('../lib/app')
	, reportback = require('reportback')()
	, _ = require('lodash')
	, rconf = require('../lib/configuration/rc')
	, captains = require('captains-log')
	, path  = require('path');

require('colors');


/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 */

module.exports = function () {

	var log = captains(rconf.log);

	console.log();
	log.info('Starting app...'.debug);
	console.log();

	// Build initial scope, mixing-in rc config
	var scope = _.merge({
		rootPath: process.cwd(),
		sailsPackageJSON: package
	}, rconf);

	// Use the app's local Sails in `node_modules` if one exists
	var appPath = process.cwd();
	var localSailsPath = path.resolve(appPath, '/node_modules/sails');

	// But first make sure it'll work...
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
