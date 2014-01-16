#!/usr/bin/env node


/**
 * Module dependencies
 */

var Sails = require('../lib/app')
	, path  = require('path')
	, captains = require('captains-log')
	, sailsgen = require('sails-generate');

/**
 * `sails new`
 *
 * Create all the files/folders for a new app at the specified path.
 * Relative and/or absolute paths are ok!
 *
 * Asset auto-"linker" is enabled by default.
 */

module.exports = function ( ) {
	
	var config = {};
	var log = captains(config.log);

	// Look at config, determine which module to use for this generator
	// `new`
	var module = 'sails-generate-new';
	var Generator = require(module);

	sailsgen( Generator, scope, {
		error: function(err) {
			log.error(err);
			return;
		},
		success: function() {
			log('Created a new app `' + scope.appName + '` at ' + scope.appPath + '.');
			return;
		},
		missingAppName: function () {
			log.error('Please choose the name or destination path for your new app.');
			return;
		}
	});
};
