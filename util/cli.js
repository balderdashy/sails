
/**
 * Module dependencies.
 */

var _ = require('lodash');




/**
 * Expose `fs`, but monkey-patched to make sure existsSync()
 * doesn't crash older versions of Node
 *
 * @api private
 */

var fs = require('fs-extra');
fs.existsSync = fs.existsSync || require('path').existsSync;
exports.fs = fs;





/**
 * Convert command-line arguments into configuration
 * options for the Sails core
 *
 * @param argv
 *
 * @api private
 */

exports.getCLIConfig = function ( argv ) {

	return {
		
		// `--silent` command-line argument
		// `--verbose` command-line argument
		// `--silly` command-line argument
		log:	argv.verbose ? {level: 'verbose'} : 
				argv.silly ? {level: 'silly'} :
				argv.silent ? {level: 'silent'} :
				undefined,

		// `--port=?` command-line argument
		port: argv.port || undefined,

		// `--prod` command-line argument
		environment: argv.prod ? 'production' : undefined

	};
};


/**
 * Methods which return a string with usage information
 * for the Sails CLI
 */

exports.usage = {

	sails: function () {
		var usage = 'Usage: sails <command>\n\n';
		// (if node_modules/sails exists, it will be used instead of the global install)\n';
		usage += _tab('sails lift') + 'Run the Sails app in the current directory:\n';
		usage += _tab('  [--prod]') + '  - in production mode \n';
		usage += _tab('  [--port 3000]') + '  - on port 3000 \n';
		usage += _tab('  [--verbose]') + '  - with verbose logging enabled \n';
		usage += '\n';
		usage += _tab('sails new <appName>') + 'Create a new Sails project in a folder called <appName>:\n';
		usage += _tab('  [--linker]') + '  - set up to auto-<link> assets w/ Grunt\n';
		usage += '\n';
		usage += _tab('sails generate model <foo>') + 'Generate a model (`api/models/Foo.js`)\n';
		usage += _tab('sails generate controller <foo>') + 'Generate a controller (`api/controllers/FooController.js`)\n';
		usage += _tab('sails generate <foo>') + 'Generate both.\n';
		usage += '\n';
		usage += _tab('sails console') + 'Run Sails in interactive mode (REPL)\n';
		usage += _tab('sails version') + 'Get the current globally installed Sails version\n';
		usage += _tab('sails run <command>') + 'Run a management command (exported by YOUR_APP/commands/index.js)';

		return usage;
	},


	generate: {
		model: function () {
			var usage = 'Usage:\n';
			usage += 'sails generate model <foo> [attribute0Name:type] [attribute1Name:attribute1Type] [...]' + '\n';
			usage += '\n';
			usage += 'E.g., to generate api/models/Cockatiel.js:' + '\n';
			usage += 'sails generate model cockatiel' + '\n';
			usage += '\n';
			usage += 'With some attributes:' + '\n';
			usage += 'sails generate model cockatiel name:string weight:float birthdate:date color:string';
		}
	}
};





/**
 * Interpret command-line arguments
 * and take the appropriate action
 *
 * Calls one of:
 *		- handler.sails
 *		- handler.console
 *		- handler.lift
 *		- handler.generate
 *		- handler.new
 *		- handler.run
 *		- handler.version
 */

exports.interpretArguments = function ( argv, handlers ) {

	if ( !_.isObject(argv) ) return handlers.invalid();
	if ( !_.isArray(argv._) ) return handlers.invalid();
	if ( !argv._.length ) return handlers.sails();
	
	var first	= argv._[0] || '',
		second	= argv._[1] || '',
		third	= argv._[2] || '',
		fourth	= argv._[3] || '',
		fifth	= argv._[4] || '',
		all		= _.map(argv._, function (arg) {return arg + '';});


	var isLift		= _.contains(['lift', 'raise', 'start', 'server', 's', 'l'], first),
		isConsole	= _.contains(['console'], first),
		isGenerate	= _.contains(['generate'], first),
		isNew		= _.contains(['new'], first),
		isVersion	= _.contains(['version'], first),
		isWWW		= _.contains(['www', 'build'], first),
		isRun		= _.contains(['run','issue'], first);


	// Interpret/validate arguments to `sails generate`
	if ( isGenerate ) {

		// Second argument is the type of module to generate
		var module = second;

		// If it's invalid, or doesn't exist, we have a usage error
		// on our hands.
		if ( !second ) {
			return handlers.invalid(
				'What type of module would you like to generate?'
			);
		}
		if ( !_.contains(['controller','model'], module) ) {
			return handlers.invalid(
				'Sorry, I don\'t know how to generate a `' + second + '`.'
			);
		}

		// Third argument is the id of the module we're creating
		var id = third;

		// If no third argument exists, this is a usage error
		// TODO: support `sails generate` again
		// 		 (for creating a model AND controller at the same time)
		if ( !id ) {
			return handlers.invalid(
				'Please specify the name for the new ' + module + '.'
			);
		}
		if ( !id.match(/^[a-z]+$/i) ) {
			return handlers.invalid(
				'Sorry, "' + id + '" is not a valid name for a ' + module + '.',
				'Only letters and numbers are allowed.',
				'(Sails ' + module + 's are case-insensitive.)'
			);
		}

		switch ( second ) {
			case 'controller':
				var controllerName = third;
				var arrayOfActionNames = argv._.splice(3);
				return handlers.generate({
					id			: controllerName,
					module		: 'controller',
					actions		: arrayOfActionNames
				});

			case 'model':
				var modelName = third;
				var arrayOfAttributes = argv._.splice(3);
				return handlers.generate({
					id			: modelName,
					module		: 'model',
					attributes	: arrayOfAttributes
				});

			case 'view':
			case 'policy':
			case 'adapter':
				return handlers.error(
				'Sorry, `sails generate ' + 
				second + '` is currently out of commission.');

			default: 
				return handlers.invalid(
				'I don\'t know how to generate a "'+second+'"!'
			);
		}
	}


	if ( isLift )		return handlers.lift();
	if ( isConsole )	return handlers.console();
	if ( isNew )		return handlers['new']();
	if ( isVersion )	return handlers.version();
	if ( isRun )		return handlers.run();
	if ( isWWW )		return handlers.www();


	// Unknown action
	return handlers.invalid( { first: first } );
};




/**
 * Return a tabbed-over version of the string,
 * adjusting for spacing
 *
 * @api private
 */
function _tab (str) {
	var n = (33 - str.length);
	return str + _.str.repeat(' ', n);
}

