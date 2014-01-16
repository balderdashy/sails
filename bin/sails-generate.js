#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, reportback = require('reportback')()
	, path  = require('path')
	, rc = require('rc')
	, _ = require('lodash')
	, captains = require('captains-log')
	, sailsgen = require('sails-generate');




/**
 * `sails generate`
 *
 * Generate module(s) for the app in our working directory.
 * Internally, uses ejs for rendering the various module templates.
 */

module.exports = function () {

	// TODO: get config
	var config = rc('sails');

	console.log(config);
	var log = captains(config.log);

	// Build initial scope
	var scope = {
		args: cliArguments,
		rootPath: process.cwd(),
		sailsPackageJSON: package
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

