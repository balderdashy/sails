#!/usr/bin/env node


/**
 * Module dependencies
 */
var _ = require('lodash')
	, program = require('./_commander')
	, package = require('../package.json');




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
program
	.command('new <appname>')
	.option('--dry')
	.description('')
	.action( require('./sails-new') );


// $ sails generate <module>
program.command('generate')
	.description('')
	.option('--dry')
	.action(require('./sails-generate'));



// $ sails console
program
	.command('console')
	.description('')
	.action( require('./sails-console') );



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





// $ sails
// 
program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED) {
  program.usageMinusWildcard();
}














//
// CLIController contains handlers containing 
// all of the logic that will then send a response
// to the user on the other side of the CLI
//


/**
 * Interpret, validate, and normalize command-line arguments.
 * Then take the appropriate action.
 */


/*
var program = {
	'--verbose': {},
	'--silly': {},
	'--silent': {},

	'lift': {
		'--env=<environment>': {},
		'--port': {},
	},

	'new <pathToNewApp>': {},

	'generate <module>': {
		'--dry': {},

		'model <resource>': {},
		'controller <resource>': {},
		'api <resource>': {},
	},

	'console': {},

	'run <cmd>': {},

	'help': {},

	'version': {}
};
// */


// var RESERVED = {
// 	usage: '_USAGE'
// };

// var REGEXP = {
// 	option: /^--/
// };

// function getUsage (program) {
// 	program[RESERVED.usage] = _.reduce(program, function (usage, v, k) {
// 		if (k.match(REGEXP.option)) {
// 			return usage + '\n'
// 		}
// 		return usage;
// 	});
// }



// module.exports = function interpretArguments ( argv, handlers ) {

// 	if ( !_.isObject(argv) ) return handlers.invalid();
// 	if ( !_.isArray(argv._) ) return handlers.invalid();
// 	if ( !argv._.length ) return handlers.usage();
	
// 	var first	= argv._[0] || '',
// 		second	= argv._[1] || '',
// 		third	= argv._[2] || '',
// 		fourth	= argv._[3] || '',
// 		fifth	= argv._[4] || '',
// 		all		= _.map(argv._, function (arg) {return arg + '';});


// 	var isLift		= _.contains(['lift', 'raise', 'start', 'server', 's', 'l'], first),
// 		isConsole	= _.contains(['console', 'c'], first),
// 		isGenerate	= _.contains(['generate'], first),
// 		isNew		= _.contains(['new'], first),
// 		isVersion	= _.contains(['version'], first),
// 		isWWW		= _.contains(['www', 'build'], first),
// 		isRun		= _.contains(['run','issue'], first);
// 		isConfigure	= _.contains(['configure'], first);


// 	// Interpret/validate arguments to `sails generate`
// 	if ( isGenerate ) {

// 		// Second argument is the type of module to generate
// 		var module = second;

// 		// Third argument is the id of the module we're creating
// 		var id = third;


// 		// If the module or id is invalid, or doesn't exist,
// 		// we have a usage error on our hands.
// 		if ( !module ) {
// 			return handlers.invalid(
// 				'What type of module would you like to generate?'
// 			);
// 		}

// 		// Whitelist
// 		var knownGenerators = [
// 			// Client
// 			'frontend',
// 			'gruntfile',

// 			// Core
// 			'backend',
// 			'controller',
// 			'model',
// 			'view',
// 			'api',
// 			'policy',

// 			// Plugins
// 			'generator',
// 			'adapter',
// 			'hook'
// 		];

// 		// Check for unknown generators
// 		// (this will be removed eventually)
// 		if ( !_.contains(knownGenerators, module) ) {
// 			return handlers.error(
// 				'Sorry, I don\'t have a "' + second + '" generator.  ' + 
// 				'Did you mean: `sails generate api '+second+'`?'
// 			);
// 		}

// 		// Check for todo/not-yet-supported generators
// 		// switch ( module ) {
// 		// 	case 'view':
// 		// 	case 'policy':
// 		// 	case 'adapter':
// 		// 		return handlers.error(
// 		// 		'Sorry, `sails generate ' + second + '` ' +
// 		// 		'is currently out of commission.');
// 		// }


// 		// If no id argument exists, this is a usage error
// 		if ( !id ) {
// 			return handlers.invalid(
// 				'Please specify the name for the new ' + module + '.'
// 			);
// 		}
// 		if ( !id.match(/^[a-z]([a-z]|[0-9])*$/i) ) {
// 			return handlers.invalid(
// 				'Sorry, "' + id + '" is not a valid name for a ' + module + '.',
// 				'Only letters and numbers are allowed, and it must start with a letter.',
// 				'(Sails ' + module + 's are case-insensitive.)'
// 			);
// 		}

// 		// Allow cli user to specify `FooController` and really mean `foo`
// 		if (module === 'controller') {
// 			id = id.replace(/Controller$/, '');
// 		}


// 		// Figure out whether subsequent cmdline args are
// 		// supposed to be controller actions or model attributes.
// 		var arrayOfArgs = argv._.splice(3);
// 		var argsLookLikeAttributes = ( arrayOfArgs[0] && arrayOfArgs[0].match(/:/) );

// 		// If module === 'model', args ALWAYS "lookLikeAttributes"
// 		if ( module==='model' ) { argsLookLikeAttributes = true; }

// 		var actions = argsLookLikeAttributes ? [] : arrayOfArgs;
// 		var attributes = argsLookLikeAttributes ? arrayOfArgs : [];


// 		// Build options
// 		var options = _.extend({}, argv, {
// 			args: [id],
// 			id: id,
// 			module: second,
// 			actions:  actions,
// 			attributes: attributes
// 		});

// 		handlers.generate(options);
// 		return;
// 	}




// 	/**
// 	 * `sails new <APPNAME>`
// 	 *
// 	 * Asset auto-"linker" is enabled by default
// 	 */
// 	if ( isNew ) {

// 		var linkerExplicitlyDisabled = (argv['linker'] === false) || (argv['linker'] === 'false');

// 		handlers['new']({
// 			appName: second,
// 			assetLinker: {
// 				enabled: linkerExplicitlyDisabled ? false : true,
// 				src: argv['linker-src'] || 'assets/linker/**/*'
// 			},
// 			dry : argv.dry
// 		});
// 		return;
// 	}





// 	if ( isLift )		return handlers.lift();
// 	if ( isConsole )	return handlers.console();
// 	if ( isVersion )	return handlers.version();
// 	if ( isRun )		return handlers.run();
// 	if ( isWWW )		return handlers.www();
// 	if ( isConfigure )	return handlers.configure();

// 	// Unknown action
// 	return handlers.invalid( { first: first } );
// };


// Build Sails options & logger using ONLY command-line args
// (the only configuration we have available at this point)
// var config = cliutil.getCLIConfig(require('optimist').argv);




// // Mix-in options and logger into each command's context
// CLIController = mergeCtx.all(CLIController, {
// 	config: config
// });

// // Interpret arguments, route to appropriate handler
// require('./arguments')( require('optimist').argv, CLIController );


// {
// 	configure : require('./commands/configure'),
// 	new       : require('./commands/new'),
// 	generate  : require('./commands/generate'),
// 	version   : require('./commands/version'),
// 	lift      : require('./commands/lift'),
// 	console   : require('./commands/console'),
// 	www       : require('./commands/www'),
// 	error     : require('./report/error'),
// 	invalid   : require('./report/invalid'),
// 	usage     : require('./report/usage')
// }


// todo move these to their respective spots:
	

	// fs			= require('fs-extra'),
	// argv		= require('optimist').argv,
	// Err			= require('../errors'),
	// CaptainsLog	= require('captains-log'),
	// Sails		= require('../lib/app');
	// cliutil		= require('sails-util/cli');
	// // _.str		= require('underscore.string'),
	// REPL		= require('repl'),
	// Grunt__		= require('./www'),
	// path		= require('path');
	// // _.str		= require('underscore.string'),
	// generate	= require('sails-generate');


	// Monkey-patch commander's `unknownOption` to allow us
// to catch the `-V` argument
// program.Command.prototype.unknownOption = function (option) {
// 	console.log(option);
// };
