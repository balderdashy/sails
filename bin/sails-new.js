#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, reportback = require('reportback')()
	, rc = require('rc')
	, _ = require('lodash')
	, path = require('path')
	, sailsgen = require('sails-generate');




/**
 * `sails new`
 *
 * Generate a new Sails app.
 */

module.exports = function ( ) {

	// Get CLI configuration
	var config = rc('sails');

	// Build initial scope
	var scope = {
		rootPath: process.cwd(),
		modules: {},
		sailsRoot: path.resolve(__dirname, '..'),
		sailsPackageJSON: package,
		viewEngine: config.viewEngine || config.template || 'ejs'
	};

	// Mix-in rc config
	_.merge(scope, config.generators);

	// TODO: just do a top-level merge and reference
	// `scope.generators.modules` as needed (simpler)
	_.merge(scope, config);


	var cliArguments = Array.prototype.slice.call(arguments);
	
	// Remove commander's extra argument
	cliArguments.pop();
	
	scope.generatorType = 'new'
	scope.args = cliArguments;

	return sailsgen( scope, {success: function(){}} );
};

