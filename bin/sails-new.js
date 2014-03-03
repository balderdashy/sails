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
		viewEngine: rconf.viewEngine
	};

	// Support --template option for backwards-compat.
	if (!scope.viewEngine && rconf.template) {
		scope.viewEngine = rconf.template;
	}

	// Mix-in rconf
	_.merge(scope, rconf.generators);

	// TODO: just do a top-level merge and reference
	// `scope.generators.modules` as needed (simpler)
	_.merge(scope, rconf);


	// Pass the original CLI arguments down to the generator
	// (but first, remove commander's extra argument)
	var cliArguments = Array.prototype.slice.call(arguments);
	cliArguments.pop();
	scope.args = cliArguments;
	
	scope.generatorType = 'new';

	return sailsgen( scope, {success: function(){}} );
};

