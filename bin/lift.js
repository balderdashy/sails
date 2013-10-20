/**
 * Module dependencies
 */
var _			= require('lodash'),
	fs			= require('fs-extra'),
	Err			= require('./_errors'),
	util		= require('./util')(),
	Sails		= require('sails/lib/app');



/**
 * Expose method which lifts the given instance of Sails
 *
 * @param {Object} options - to pass to sails.lift()
 */

module.exports = function liftSails( options ) {

	var app = {
		path	: process.cwd()
	};

	var localSails = {
		path: process.cwd() + '/node_modules/sails'
	};


	// Has no package.json file
	if ( ! fs.existsSync( app.path + '/package.json') ) {
		Err.fatal.noPackageJSON();
		return;
	}

	// Load this app's package.json and dependencies
	app.package = util.getPackage(app.path);
	app.dependencies = app.package.dependencies;


	// Package.json exists, but doesn't list Sails as a dependency
	if ( !(app.dependencies.sails) ) {
		Err.fatal.notSailsApp();
		return;
	}

	// Check if local Sails (`node_modules/sails`) exists
	// If no local Sails exists, run the app using the current version of Sails
	// (this is probably always the global install, since this is the CLI)
	if ( !fs.existsSync(localSails.path) ) {

		// Run app using global Sails
		var currentSails = new Sails();
		currentSails.lift(options);
		return;
	}

	// Read the package.json in the local installation of Sails
	localSails.package = util.getPackage(localSails.path);

	// Local Sails has corrupted package.json
	if ( !localSails.package ) {
		Err.fatal.badLocalDependency(localSails.path, app.dependencies.sails);
	}

	// Lookup version in package.json
	// Error out if it has the wrong version in its package.json
	// TODO: use npm's native version comparator
	var requiredSailsVersion = app.dependencies.sails;
	if (requiredSailsVersion !== localSails.package.version) {
		Err.warn.incompatibleLocalSails(requiredSailsVersion, localSails.package.version);
	}

	// Load the local version of Sails
	// Then run the app with it
	localSails.lift = require( localSails.path + '/lib' ).lift;
	localSails.lift(options);

};
