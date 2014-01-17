#!/usr/bin/env node


/**
 * Module dependencies
 */

var package = require('../package.json')
	, reportback = require('reportback')()
	, rc = require('rc')
	, _ = require('lodash')
	, async = require('async')
	, sailsgen = require('sails-generate');




/**
 * `sails generate`
 *
 * Generate module(s) for the app in our working directory.
 * Internally, uses ejs for rendering the various module templates.
 */

module.exports = function ( ) {

	// Get CLI configuration
	var config = rc('sails');


	// Build initial scope
	var scope = {
		rootPath: process.cwd(),
		modules: {},
		sailsPackageJSON: package,
	};

	// Mix-in rc config
	_.merge(scope, config.generators);

	// TODO: just do a top-level merge and reference
	// `scope.generators.modules` as needed (simpler)
	_.merge(scope, config);


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

	// If the generator type is "api", run both the controller and model generators
	// and add in a couple extra log messages.
	if (scope.generatorType == 'api') {

		// 'api' only takes one argument, so ignore the rest
		cliArguments = [cliArguments[0]];

		// Create the controller and model
		async.parallel(_.map(['controller', 'model'], subGen), function(err) {
			// As long as there were no errors, add some logs about how to call the new API
			if (!err) {
				cb.log.info('REST API will be available next time you lift the server.');
				cb.log.info('(@ `/' + cliArguments[0] + '` with default settings)');
			}
		});

		// Create a function suitable for use with async.parallel to run a generator.
		// Uses "cb.log" b/c it has that nice log format.
		function subGen(generator) {
			var _scope = _.extend(_.cloneDeep(scope), {generatorType: generator});
			return function(_cb) {
				sailsgen (_scope, {
					success: function() {
						cb.log.info('Generated a new '+_scope.generatorType+' `'+_scope.id+'` at '+_scope.destDir+_scope.globalID+'.js!');
						return _cb();
					},
					error: function(err) {
						cb.error(err);
						return _cb(err);
					}
				});
			}
		}

	}

	// Otherwise just run whichever generator was requested.
	else {
		cb.success = function() {
			cb.log.info('Generated a new '+scope.generatorType+' `'+scope.id+'` at '+scope.destDir+scope.globalID+'.js!');
		}
		return sailsgen( scope, cb );
	}

};

