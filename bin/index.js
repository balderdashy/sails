#!/usr/bin/env node


/**
 * Module dependencies
 */
var _			= require('lodash'),
	fs			= require('fs-extra'),
	argv		= require('optimist').argv,
	Errors		= require('./_errors'),
	Logger		= require('../lib/hooks/logger/captains'),
	Sails		= require('../lib/app');
	util		= require('../util');
	_.str		= require('underscore.string'),
	REPL		= require('repl'),
	Grunt__		= require('./www'),
	path		= require('path');
	_.str		= require('underscore.string');



// Build Sails options using command-line arguments
var sailsOptions = util.getCLIConfig(argv);

// Build logger
var log = new Logger(sailsOptions.log);


// Handlers containing all of the logic & responses
// to run/send back to the CLI
var CLIController = {




	/**
	 * `sails new`
	 *
	 * Create all the files/folders for a new app at the specified path.
	 * Relative and/or absolute paths are ok!
	 */
	new: function () {
		log.error('Sorry, `sails new` is currently out of commission.');
		process.exit(1);
	},







	/**
	 * `sails generate`
	 *
	 * Generate module(s) for the app in our working directory.
	 */

	generate: function ( options ) {

		// Change this line if this module gets pulled out separately
		var handlers = CLIController;

		// TODO: Load up Sails in the working directory in case
		// custom paths have been configured
		var path,
			errors,
			filename,
			attributes,
			actions,
			ext					= options.ext || 'js',
			appPath				= options.appPath || process.cwd(),
			module				= options.module,
			id					= options.id,
			globalID			= options.globalID || _.str.capitalize(options.id);
		

		switch ( module ) {

			case 'controller':

				path = options.path || appPath + '/api/controllers';
				filename = globalID + 'Controller.' + ext;

				// Validate optional action arguments
				errors = [];
				actions = _.map(attributes, function (action, i) {
					
					// TODO: validate action names
					var invalid = false;

					// Handle errors
					if (invalid) {
						return errors.push(
							'Invalid action notation:   "' + action + '"');
					}
					return action;
				});

				// Handle invalid action arguments
				// Send back errors
				if (errors.length) {
					return handlers.invalid.apply(handlers, errors);
				}

				// TODO: generate controller
				break;



			case 'model':

				path = options.path || appPath + '/api/models';
				attributes = options.attributes;
				filename = globalID + '.' + ext;

				// Validate optional attribute arguments
				errors = [];
				attributes = _.map(attributes, function (attribute, i) {
					var parts = attribute.split(':');

					if ( parts[1] === undefined ) parts[1] = 'string';

					// Handle errors
					if (!parts[1] || !parts[0]) {
						errors.push(
							'Invalid attribute notation:   "' + attribute + '"');
						return;
					}
					return {
						name: parts[0],
						type: parts[1]
					};
				});

				// Handle invalid attribute arguments
				// Send back errors
				if (errors.length) {
					return handlers.invalid.apply(handlers, errors);
				}

				// TODO: generate model
				// generate.generateModel(module, modelOpts);
				break;
		}



		// Finish up with a success message

		// If attributes were specified:
		if (attributes) {
			log.info('Generated a new model called ' + globalID + ' with attributes:');
			_.each(attributes, function (attr) {
				log.info('  ',attr.name,'    (' + attr.type + ')');
			});
		}

		// General case
		else log.info('Generated ' + module + ' `' + globalID + '`!');

		// Finally,
		log.verbose('New file created: ' + path + '/' + filename);
		process.exit(0);
	},







	/**
	 * `sails console`
	 *
	 * Enter the interactive console (aka REPL) for the app
	 * in our working directory.
	 */

	console: function () {
		var sails = new Sails();
		sails.load(_.merge(sailsOptions,{
			hooks: false,
			globals: false
		}), function (err) {
			if (err) return Err.fatal.failedToLoadSails(err);

			var appID		= _.str.capitalize(path.basename(process.cwd())),
				appName		= _.str.capitalize(appID);

			console.log();
			log('Welcome to the Sails console (v' + sails.version + ')');
			log('( to exit, type <CTRL>+<C> )');
			log.verbose('Lifting `'+process.cwd()+'` in interactive mode...');

			// Hide ship log to keep from dirtying up REPL
			sails = new Sails();
			sails.lift(_.merge(sailsOptions,{log:{noShip: true}}), function (err) {
				if (err) return Err.fatal.failedToLoadSails(err);

				var repl = REPL.start('sails> ');
				repl.on('exit', function (err) {
					if (err) {
						log.error(err);
						process.exit(1);
					}
					process.exit(0);
				});
				
			});
		});	
	},







	/**
	 * `sails run`
	 *
	 * Issue a command/instruction
	 */

	run: function () {
		log.error('Sorry, `sails run` is currently out of commission.');
		process.exit(1);
	},







	/**
	 * `sails www`
	 *
	 * Build a www directory from the assets folder.
	 * Uses the Gruntfile.
	 */

	www: function () {
		var wwwPath = path.resolve( process.cwd(), './www' ),
			wwwTaskName = 'build';

		log.info('Compiling assets into standalone `www` directory with `grunt ' + wwwTaskName + '`...');

		var sails = new Sails();
		sails.load(_.merge(sailsOptions,{
			hooks: {
				grunt: false
			},
			globals: false
		}), function sailsReady (err) {
			if (err) return Err.fatal.failedToLoadSails(err);

			var Grunt = Grunt__(sails);
			Grunt( wwwTaskName );

			// Bind error event
			sails.on('hook:grunt:error', function (err) {
				log.error('Error occured starting `grunt ' + wwwTaskName + '`');
				log.error('Please resolve any issues and try running `sails www` again.');
				process.exit(1);
			});

			// Task is not actually complete yet-- it's just been started
			// We'll bind an event listener so we know when it is
			sails.on('hook:grunt:done', function () {
				log.info();
				log.info('Created `www` directory at:');
				log.info(wwwPath);
				process.exit(0);
			});
		});
	},







	/**
	 * `sails version`
	 *
	 * Output the version of the Sails in our working directory-
	 * i.e. usually, the version we installed with `npm install sails`
	 *
	 * If no local installation of Sails exists, display the version
	 * of the Sails currently running this CLI code- (that's me!)
	 * i.e. usually, the version we installed with `sudo npm install -g sails`
	 */

	version: function () {
		var sails = new Sails();
		sails.load( _.merge(sailsOptions,{
			hooks: false,
			globals: false
		}), function (err) {
			if (err) return Err.fatal.failedToLoadSails(err);
			log.info('v' + sails.version);
		});
	},





	/**
	 * `sails lift`
	 * 
	 * Fire up the Sails app in our working directory.
	 */
	lift: function () {
		require('./lift')(sailsOptions);
	},
	



	
	/**
	 * User entered an unknown or invalid command.
	 *
	 * Print out usage and stuff.
	 */

	invalid: function ( /* [msg1|options], [msg2], [msg3], [...] */ ) {
		var args = Array.prototype.slice.call(arguments, 0),
			options = _.isPlainObject(args[0]) ? args[0] : null,
			messages = !_.isPlainObject(args[0]) ? args : args.splice(1);

		// If options were specified, it should contain the arguments
		// that were passed to the CLI.  Build the best error message
		// we can based on what we know.
		if ( options ) {
			if ( !options.first ) {
				messages.push('Sorry, I don\'t understand what that means.');
			}
			else messages.push('Sorry, I don\'t understand what `'+options.first+'` means.');
		}

		// Iterate through any other message arguments
		// and output a console message for each
		_.each(messages, function (msg) {
			log.error(msg);
		});

		// Finish up with an explanation of how to get more docs/information
		// on using the Sails CLI.
		// console.log('');
		log.info( 'To get help using the Sails command-line tool, run `sails`.');
	},





	/**
	 * Sails CLI internal error occurred.
	 *
	 * Print error message.
	 */

	error: function ( err ) {
		log.error( 'An error occurred.' );
		log.error( err );
		console.log('');
	},






	/**
	 * The CLI was run with no arguments.
	 *
	 * Print welcome message and usage info.
	 */

	sails: function () {
		var sails = new Sails();
		sails.load( _.merge(sailsOptions, {
			hooks: false,
			globals: false
		}), function (err) {
			if (err) return Err.fatal.failedToLoadSails(err);
			console.log('');
			log.info('Welcome to Sails! (v' + sails.version + ')');
			log.info( util.usage.sails() );
			console.log('');
		});
	}
};



// Interpret arguments, route to appropriate handler
util.interpretArguments( argv, CLIController );
























	// // Check for newer version and upgrade if available.
	// else if (_.contains(['upgrade'], argv._[0])) {
	// 	var sys = require('sys');
	// 	var exec = require('child_process').exec;
	// 	var child;
	// 	var http = require('http');
	// 	var newest;
	// 	var current;
	// 	var options = {
	// 		host: 'registry.npmjs.org',
	// 		port: 80,
	// 		path: '/sails'
	// 	};
	// 	http.get(options, function (res) {
	// 		var jsond = '';
	// 		var body = '';
	// 		res.on('data', function (chunk) {
	// 			body += chunk;
	// 		});
	// 		res.on('end', function () {
	// 			jsond = JSON.parse(body);
	// 			if (jsond['dist-tags'].latest > sails.version) {
	// 				// executes `pwd`
	// 				child = exec('npm install sails@' + jsond['dist-tags'].latest, function (error, stdout, stderr) {
	// 					if (error !== null) {
	// 						console.log('exec error: ' + error);
	// 					}
	// 					console.log('Upgrade Complete:  You are now on Sails Version: ' + jsond['dist-tags'].latest);
	// 				});
	// 			} else {
	// 				console.log('Already Up To Date');
	// 			}
	// 		});
	// 	}).on('error', function (e) {
	// 		console.error(e);
	// 	});
	// }



	// // Get the sails version
	// else if (argv.v || argv.version || (argv._[0] && _.contains(['v', 'version'], argv._[0]))) {
	// 	log.info('v' + sails.version);
	// }



	// // Generate file(s)
	// else if (argv._[0] && (argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/) || argv.g || argv.generate)) {

	// 	verifyArg(1, 'Please specify the name for the new model and controller as the second argument.');


	// 	// Generate a model
	// 	if (argv._[1] === 'model') {
	// 		var entity = argv._[2];
	// 		verifyArg(2, 'Please specify the name for the new model as the third argument.');

			// // Figure out attributes based on args
			// var modelOpts = _.extend({}, argv);
			// var args = argv._.splice(3);
			// modelOpts.attributes = [];
			// _.each(args, function (attribute, i) {
			// 	var parts = attribute.split(':');
			// 	if (!parts[1]) {
			// 		log.error('Please specify the type for attribute ' + (i + 1) + ' '' + parts[0] + ''.');
			// 		process.exit(1);
			// 	}
			// 	modelOpts.attributes.push({
			// 		name: parts[0],
			// 		type: parts[1].toUpperCase()
			// 	});
			// });

	// 		log.warn('For the record :: to serve the blueprint API for this model,');
	// 		log.warn('you\'ll also need to have an empty controller.');
	// 		generate.generateModel(entity, modelOpts);
	// 		log.info('Generated model for ' + entity + '!');
	// 	}

	// 	// Generate a controller
	// 	else if (argv._[1] === 'controller') {
			// verifyArg(2, 'Please specify the name for the new controller as the third argument.');

			// // Figure out actions based on args
			// var controllerOpts = _.clone(argv);
			// controllerOpts.actions = argv._.splice(3);
			// generate.generateController(argv._[2], controllerOpts);
			// log.info('Generated controller for ' + argv._[2] + '!');
	// 	}

	// 	// Generate a view
	// 	// TODO: Do this properly, per view engine!
	// 	// else if(argv._[1] === 'view') {
	// 	// 	var entity = argv._[2];
	// 	// 	verifyArg(2, 'Please specify the name for the new view as the third argument.');
	// 	// 	// Figure out actions based on args
	// 	// 	var options = _.extend({},argv);
	// 	// 	options.actions = argv._.splice(3);
	// 	// 	generate.generateView(entity, options);
	// 	// }

	// 	// TODO: Generate a policy

	// 	// Generate an adapter
	// 	else if (argv._[1] === 'adapter') {
	// 		verifyArg(2, 'Please specify the name for the new argument as the third argument.');

	// 		// Figure out attributes based on args
	// 		generate.generateAdapter(argv._[2], _.clone(argv));
	// 		log.info('Generated adapter for ' + argv._[2] + '!');
	// 	}
	// 	// Otherwise generate a model and controller
	// 	else {
	// 		verifyArg(1, 'Please specify the name of the entity as the second argument to generate a model, controller, and view.');
	// 		log.info('Generating model and controller for ' + argv._[1] + '...');

	// 		var generateOptions = _.clone(argv);
	// 		generateOptions.actions = argv._.splice(2);
	// 		generate.generateModel(argv._[1], generateOptions);
	// 		generate.generateController(argv._[1], generateOptions);
	// 	}
	// }

	// // Create a new app
	// // second argument == app name
	// else if (argv._[0].match(/^new$/)) {

	// 	verifyArg(1, 'Please specify the name of the new project directory to create: e.g.\n sails new <appName>');

	// 	// Change to single options object we pass in.
	// 	newSailsApp({
	// 		appName: argv._[1],

	// 		// Default to ejs templates for new projects, but allow user to override with --template
	// 		templateLang: argv.template || 'ejs',

	// 		// Default to not using the script linker functionality, 
	// 		// but use it if --linker option is set
	// 		useLinker: !!argv.linker
	// 	});
	// }

	// // Build a www directory of everyting from /.tmp/public (aka /assets)
	// else if (argv._[0].match(/^build$/)) {
	// 	return sails.build();
	// }

	// /**
	//  * Run a management command. Management commands should take a single callback argument.
	//  * 
	//  * Usage: sails issue <foo>
	//  *    – where <foo> is exported from <sails.config.appPath>/commands
	//  */
	// else if (argv._[0].match(/^(issue|run)$/)) {

	// 	verifyArg(1, 'Please specify the name of the command to run: e.g.\n sails run <command>');

	// 	var command = argv._[1],
	// 			commands;

	// 	try {
	// 		commands = require(sails.config.appPath + '/commands');
	// 	} catch(e) {
	// 		log.error('\nModule not found. Tips:\n' +
	// 			'* Make sure to run this command from your app path where app.js is located.\n' +
	// 			'* Make sure commands/index.js' exists at your app root.');
	// 		process.exit(e.code);
	// 	}

	// 	if (!_.has(commands, command)) {
	// 		log.error('Command not found. Does ' + sails.config.appPath + '/commands/index.js export '' + command + ''?');
	// 		process.exit(1);
	// 	}

	// 	sails.lift({
	// 		log: {
	// 			level: 'silent'
	// 		}
	// 	}, function () {
	// 		log.verbose('Issuing task '' + command + ''...');
	// 		commands[command](function() {
	// 			log.verbose('Crew successfully carried out their task: '' + command + ''!');
	// 			process.exit();
	// 		});
	// 	});

	// 	return;
	// }


	

	// // Verify that an argument exists
	// function verifyArg(argNo, msg) {
	// 	if (!argv._[argNo]) {
	// 		log.error(msg);
	// 		process.exit(1);
	// 	}
	// }
