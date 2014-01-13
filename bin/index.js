#!/usr/bin/env node


/**
 * Module dependencies
 */

var	CaptainsLog	= require('captains-log')
, mergeCtx = require('extend-context')
, CLIController = {
	configure : require('./commands/configure'),
	new       : require('./commands/new'),
	generate  : require('./commands/generate'),
	version   : require('./commands/version'),
	lift      : require('./commands/lift'),
	console   : require('./commands/console'),
	www       : require('./commands/www'),
	error     : require('./error'),
	invalid   : require('./invalid'),
	usage     : require('./usage')
};



//
// CLIController contains handlers containing 
// all of the logic that will then send a response
// to the user on the other side of the CLI
//


// Build Sails options using ONLY command-line arguments
// (the only configuration we have available at this point)
var sailsOptions = cliutil.getCLIConfig(require('optimist').argv);

// Build logger
var logger = new CaptainsLog(sailsOptions.log);


// Mix-in options and logger into each command's context
CLIController = mergeCtx.all(CLIController, {
	sailsOptions: sailsOptions,
	logger: logger
});

// Interpret arguments, route to appropriate handler
_interpretArgs( argv, CLIController );

_			= require('lodash'),
	fs			= require('fs-extra'),
	argv		= require('optimist').argv,
	Err			= require('../errors'),
	CaptainsLog	= require('captains-log'),
	Sails		= require('../lib/app');
	_interpretArgs = require('./arguments');
	cliutil		= require('sails-util/cli');
	_.str		= require('underscore.string'),
	REPL		= require('repl'),
	Grunt__		= require('./www'),
	path		= require('path');
	_.str		= require('underscore.string'),
	generate	= require('sails-generate');