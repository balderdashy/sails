#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, rconf = require('../lib/configuration/rc')
	, _ = require('lodash')
	, path = require('path')
	, sailsgen = require('sails-generate');




/**
 * `sails new`
 *
 * Generate a new Sails app.
 */

module.exports = function ( ) {

	// Build initial scope
	var scope = {
		rootPath: process.cwd(),
		modules: {},
		sailsRoot: path.resolve(__dirname, '..'),
		sailsPackageJSON: package,
		viewEngine: rconf.viewEngine || rconf.template
	};

	// Mix-in rconf
	_.merge(scope, rconf.generators);

	// TODO: just do a top-level merge and reference
	// `scope.generators.modules` as needed (simpler)
	_.merge(scope, rconf);


	var cliArguments = Array.prototype.slice.call(arguments);
	
	// Remove commander's extra argument
	cliArguments.pop();
	
	scope.generatorType = 'new';
	scope.args = cliArguments;

	return sailsgen( scope, {success: function(){}} );
};

