#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, reportback = require('reportback')()
	, _ = require('lodash')
	, rconf = require('../lib/configuration/rc')
	, async = require('async')
	, sailsgen = require('sails-generate');




/**
 * `sails generate`
 *
 * Generate module(s) for the app in our working directory.
 * Internally, uses ejs for rendering the various module templates.
 */

module.exports = function ( ) {

	// Build initial scope
	var scope = {
		rootPath: process.cwd(),
		modules: {},
		sailsPackageJSON: package,
	};

	// Mix-in rc config
	_.merge(scope, rconf.generators);

	// TODO: just do a top-level merge and reference
	// `scope.generators.modules` as needed (simpler)
	_.merge(scope, rconf);


	// Get command-line arguments
	var cliArguments = Array.prototype.slice.call(arguments);
	
	// Remove commander's extra argument
	cliArguments.pop();
	
	// Peel off the generatorType and the rest of the args
	scope.generatorType = cliArguments.shift();
	scope.args = cliArguments;

	// Create a new reportback
	var cb = reportback.extend();

	// Set the "invalid" exit to forward to "error"
	cb.invalid = 'error';

	// If the generator type is "api", we currently treat it as a special case.
	// (todo: pull this out into a simple generator)
	if (scope.generatorType === 'api') {
		require('./_generate-api')(scope, cb);
	}

	// Otherwise just run whichever generator was requested.
	else {
		cb.success = function() {
			cb.log.info('Generated a new '+scope.generatorType+' `'+scope.id+'` at '+scope.destDir+scope.globalID+'.js!');
		};

		// 
		return sailsgen( scope, cb );
	}

};

