
/**
 * Module dependencies.
 */

var _			= require('lodash'),
	argv		= require('optimist').argv,
	Logger		= require('../lib/hooks/logger/captains');



// Start building object to export
var util = {};


/**
 * Expose `fs`, but monkey-patched to make sure existsSync()
 * doesn't crash older versions of Node
 *
 * @api private
 */

var fs = require('fs-extra');
fs.existsSync = fs.existsSync || require('path').existsSync;
util.fs = fs;





/**
 * Convert command-line arguments into configuration
 * options for the Sails core
 *
 * @param argv
 *
 * @api private
 */

util.getCLIConfig = function ( argv ) {

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



// Build logger using command-line config
var log = new Logger(util.getCLIConfig(argv).log);


/**
 * Methods which return a string with usage information
 * for the Sails CLI
 */

util.usage = {

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
		usage += _tab('  [--dry]') + 'Don\'t actually create the module file.\n';
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

util.interpretArguments = function ( argv, handlers ) {

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
					actions		: arrayOfActionNames,
					dry			: argv.dry
				});

			case 'model':
				var modelName = third;
				var arrayOfAttributes = argv._.splice(3);
				return handlers.generate({
					id			: modelName,
					module		: 'model',
					attributes	: arrayOfAttributes,
					dry			: argv.dry
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
 * Generate a file
 *
 * @api private
 */

util.generateFile = function(boilerplatePath, newPath) {
	var fullBpPath = __dirname + '/boilerplates/' + (boilerplatePath || '');
	var file = fs.readFileSync(fullBpPath, 'utf8');
	var newFilePath = (newPath || '');
	util.verifyDoesntExist(newFilePath, 'A file/directory already exists at ' + newFilePath);

	// Touch output file to make sure the path to it exists
	if (fs.createFileSync(newFilePath)) {
		log.error('Could not create file, ' + newFilePath + '!');
		process.exit(1);
	}
	fs.writeFileSync(newFilePath, file);
};



/**
 * Generate a directory
 *
 * @api private
 */

util.generateDir = function(newPath, gitkeep) {
	if (!newPath) {
		log.verbose('Creating directory in pwd...');
	} else {
		log.verbose('Creating directory directory in ' + newPath + '...');
	}
	var newDirPath = (newPath || '');
	util.verifyDoesntExist(newDirPath, 'A file/directory already exists at ' + newDirPath);
	fs.mkdirSync(newDirPath);
	// If directory will be empty, create a .gitkeep in it
	if (gitkeep) {
		generateFile('.gitkeep', newPath + '/.gitkeep');
	}
};


/**
 * Verify that a file doesn't exist
 *
 * @api private
 */

util.verifyDoesntExist = function(path, msg) {
	if (util.fileExists(path)) {
		log.error(msg);
		process.exit(1);
	}
};



/** 
 * Check if a file or directory exists
 *
 * @api private
 */

util.fileExists = function(path) {
	try {
		// Query the entry
		var stats = fs.lstatSync(path);

		// Is it a directory?
		if (stats.isDirectory() || stats.isFile()) {
			return true;
		}
	} catch (e) {
		// ...
	}

	return false;
};



/** 
 * Read a boilerplate and render the template
 *
 * @api private
 */

util.renderBoilerplateTemplate = function(boilerplate, data) {
	var boilerplatePath = __dirname + '/boilerplates/templates/' + boilerplate;
	util.verifyExists(boilerplatePath, "Boilerplate (" + boilerplate + ") doesn't exist!");
	var file = fs.readFileSync(boilerplatePath, 'utf8');
	return ejs.render(file, data);
};



/** 
 *
 *
 * @api private
 */

util.verifyExists = function(path, msg) {
	if (!util.fileExists(path)) {
		log.error(msg);
		process.exit(1);
	}
};



/** 
 * Copy a boilerplate directory or file
 *
 * @api private
 */

util.copyBoilerplate = function(boilerplate, destination, cb) {
	var boilerplatePath = __dirname + '/boilerplates/' + boilerplate;
	fs.copy(boilerplatePath, destination, function(err) {
		return cb && cb(err);
	});
};



/** 
 * Copy global sails module into current project as a local dependency
 * (currently unusued)
 *
 * @api private
 */

util.copySails = function(destination, cb) {
	try {
		fs.mkdirSync(destination);
	} catch (e) {
		return cb && cb(e);
	}

	// Progress notifications
	var stopShowingProgressNotifications,
		errorCopying,
		interval = 150;


	// Draw progress notification
	// Returns progress function
	log.verbose('Copying modules into ' + destination + '...');
	var canvas = turtle();

	async.until(

	function checkIfDone() {
		canvas.tick();
		return stopShowingProgressNotifications;
	},

	function setAlarm(cb) {
		setTimeout(cb, interval);
	},

	function done(err) {
		// If an error occurred, send it back
		err = err || errorCopying;
		return cb && cb(err);
	});

	async.each(['lib', 'package.json', 'node_modules'], function(fileOrDir, cb) {
		fs.copy(__dirname + '/../' + fileOrDir, destination + '/' + fileOrDir, cb);
	}, function doneCopying(err) {

		// Hold onto error if there is one
		errorCopying = err;

		// When finished copying, mark done
		// progress notifications will trigger the callback
		stopShowingProgressNotifications = true;
	});
};



/** 
 * Copy a core Sails dependency to the top-level node_modules directory
 * of the current application---- in a smart way
 *
 * @api private
 */

util.copySailsDependency = function(moduleName, pathToNewNodeModules, cb) {
	var path = __dirname + '/../node_modules/' + moduleName;
	fs.copy(path, pathToNewNodeModules + '/' + moduleName, function(err) {
		if (err) return cb && cb(err);

		// Parse the module's package.json
		var packageJSONPath = path + '/package.json';
		var packageJSON;
		try {
			packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));
		} catch (e) {

			// Ignore missing package.json
			packageJSON = {
				dependencies: {}
			};
		}

		// Get actual dependencies in this module's node_modules directory
		var dependencies;
		try {
			dependencies = fs.readdirSync(path + '/node_modules');

			// Remove hidden files
			_.without(dependencies, function(val) {
				return val.match(/\..+/);
			});
		} catch (e) {
			// Assume empty dependencies
			dependencies = {};
		}

		// If there are any missing dependencies which are being pulled from Sails,
		// copy them from Sails' main node_modules directory
		var missingModules = _.difference(_.keys(packageJSON.dependencies || {}), _.values(dependencies));
		_.each(missingModules, function(missingModuleName) {
			log.verbose('Resolving ' + moduleName + '\'s missing dependency (' + missingModuleName + ') using the version in Sails.');
			util.copySailsDependency(missingModuleName, pathToNewNodeModules + '/' + moduleName + '/node_modules/');
		});

		return cb && cb(err);
	});
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



// Export `util` object
module.exports = _.cloneDeep(util);
