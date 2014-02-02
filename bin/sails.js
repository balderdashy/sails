#!/usr/bin/env node


/**
 * Module dependencies
 */
var _ = require('lodash')
	, program = require('./_commander')
	, package = require('../package.json')
	, NOOP    = function(){};




program
	.version(package.version, '-v, --version');


//
// Normalize version argument, i.e.
// 
// $ sails -v
// $ sails -V
// $ sails --version
// $ sails version
//


// make `-v` option case-insensitive
process.argv = _.map(process.argv,function(arg){
	return (arg === '-V') ? '-v' : arg;
});


// $ sails version (--version synonym)
program
	.command('version')
	.description('')
	.action( program.versionInformation );





program
	.option('--silent')
	.option('--verbose')
	.option('--silly');



// $ sails lift
program
	.command('lift')
	.option('--prod')
	.option('--port')
	.description('')
	.action( require('./sails-lift') );


// $ sails new <appname>
var newCmd = program.command('new [appname]');
newCmd.unknownOption = NOOP;
	newCmd
		.option('--dry')
		.option('--viewEngine [viewEngine]')
		.option('--template [viewEngine]')
		.action(require('./sails-new'));


// $ sails generate <module>
var generate = program.command('generate');
generate.unknownOption = NOOP;
generate
	.description('')
	.option('--dry')
	.action(require('./sails-generate'));



// $ sails console
program
	.command('console')
	.description('')
	.action( require('./sails-console') );


// $ sails www
var www = program
	.command('www');
www.unknownOption = NOOP;
www
	.description('')
	.action( require('./sails-www') );



// $ sails debug
program
	.command('debug')
	.description('')
	.action( require('./sails-debug') );


// $ sails configure
program
	.command('configure')
	.description('')
	.action( require('./sails-configure') );







//
// Normalize help argument, i.e.
// 
// $ sails --help
// $ sails help
// $ sails
// $ sails <unrecognized_cmd>
//


// $ sails help (--help synonym)
program
	.command('help')
	.description('')
	.action( program.usageMinusWildcard );




// $ sails <unrecognized_cmd>
// Mask the '*' in `help`.
program
	.command('*')
	.action( program.usageMinusWildcard );



// Don't balk at unknown options
program.unknownOption = NOOP;



// $ sails
// 
program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
  program.usageMinusWildcard();
}

