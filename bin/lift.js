/**
 * Module dependencies
 */
var _			= require('lodash'),
	argv		= require('optimist').argv,
	fs			= require('fs-extra'),
	Err			= require('./_errors'),
	util		= require('../util'),
	Logger		= require('../lib/hooks/logger/captains'),
	Sails		= require('../lib/app');


// Build logger using command-line config
var log = new Logger(util.getCLIConfig(argv).log);


/**
 * Expose method which lifts the given instance of Sails
 *
 * @param {Object} options - to pass to sails.lift()
 */

module.exports = function liftSails( options ) {

	// Ensure options passed in are not mutated
	options = _.clone(options);

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
	app.package = util.getPackageSync(app.path);
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
	localSails.package = util.getPackageSync(localSails.path);

	// Local Sails has corrupted package.json
	if ( !localSails.package ) {
		Err.fatal.badLocalDependency(localSails.path, app.dependencies.sails);
	}

	// Lookup sails dependency requirement in app's package.json
	var requiredSailsVersion = app.dependencies.sails;

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
	if ( !isUsingGit && requiredSailsVersion !== localSails.package.version) {
		Err.warn.incompatibleLocalSails(requiredSailsVersion, localSails.package.version);
	}

	// Load the local version of Sails
	// Then run the app with it
	localSails.lift = require( localSails.path + '/lib' ).lift;
	localSails.lift(options);

};
