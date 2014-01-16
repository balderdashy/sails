#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, reportback = require('reportback')()
	, rc = require('rc')
	, _ = require('lodash')
	, sailsgen = require('sails-generate');




/**
 * `sails generate`
 *
 * Generate module(s) for the app in our working directory.
 * Internally, uses ejs for rendering the various module templates.
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

	var cliArguments = Array.prototype.slice.call(arguments);
	
	// Remove commander's extra argument
	cliArguments.pop();
	
	// Peel off the generatorType and the rest of the args
	scope.generatorType = cliArguments.shift();
	scope.args = cliArguments;

	return sailsgen( scope, reportback.extend() );
};

