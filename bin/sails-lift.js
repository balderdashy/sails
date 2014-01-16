#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app')
	, path  = require('path')
	, captains = require('captains-log');



/**
 * `sails lift`
 *
 * Expose method which lifts the appropriate instance of Sails.
 * (Fire up the Sails app in our working directory.)
 *
 * @param {Object} options - to pass to sails.lift()
 */

module.exports = function () {

	var config = {};
	var log = captains(config.log);

	// Use the app's local Sails in `node_modules` if one exists
	var appPath = process.cwd();
	var localSailsPath = appPath + '/node_modules/sails';

	// But first make sure it'll work...
	if (Sails.isLocalSailsValid(localSailsPath, appPath)) {
		require(localSailsPath + '/lib').lift(options);
		return;
	}

	// Otherwise, if no workable local Sails exists, run the app 
	// using the currently running version of Sails.  This is 
	// probably always the global install.
	var globalSails = new Sails();
	globalSails.lift(options);
	return;
};
