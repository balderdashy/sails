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
		args: cliArguments,
		rootPath: process.cwd(),
		sailsPackageJSON: package,
		options: {
			maxDepth: 5
		}
	};

	// Mix-in rc config
	_.merge(scope, config.generators);

	// Peel off the generatorType
	var cliArguments = Array.prototype.slice.call(arguments);
	cliArguments.pop();
	scope.generatorType = cliArguments.shift();
	scope.args = cliArguments;

	return sailsgen( scope, reportback.extend() );
};

