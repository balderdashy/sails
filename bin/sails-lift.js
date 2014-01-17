#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, Sails = require('../lib/app')
	, rc = require('rc')
	, reportback = require('reportback')()
	, _ = require('lodash')
	, path  = require('path');



/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 */

module.exports = function () {

	// Get CLI configuration
	var config = rc('sails');


	// Build initial scope
	var scope = {
		rootPath: process.cwd(),
		sailsPackageJSON: package
	};

	// Mix-in rc config
	_.merge(scope, config.generators);

	// TODO: just do a top-level merge and reference
	// `scope.generators.modules` as needed (simpler)
	_.merge(scope, config);

	// Use the app's local Sails in `node_modules` if one exists
	var appPath = process.cwd();
	var localSailsPath = path.resolve(appPath, '/node_modules/sails', '/lib');

	// But first make sure it'll work...
	if ( Sails.isLocalSailsValid(localSailsPath, appPath) ) {
		require(localSailsPath).lift(scope);
		return;
	}

	// Otherwise, if no workable local Sails exists, run the app 
	// using the currently running version of Sails.  This is 
	// probably always the global install.
	var globalSails = new Sails();
	globalSails.lift(scope);
	return;
};
