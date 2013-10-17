#!/usr/bin/env node


/**
 * Module dependencies
 */
var _			= require('lodash'),
	fs			= require('fs-extra'),
	argv		= require('optimist').argv,
	Errors		= require('./_errors'),
	Logger		= require('sails/lib/logger')(),
	Sails		= require('sails/lib/app');
	util		= require('./util.js')();
	_.str		= require('underscore.string'),
	REPL		= require('repl'),
	Grunt__		= require('./gruntTask'),
	path		= require('path');


/**
 * Build Sails options using command-line arguments
 */
var sailsOptions = {

	// `--verbose` command-line argument
	log: argv.verbose ? {level: 'verbose'} : undefined,

	// `--port=?` command-line argument
	port: argv.port || undefined,

	// `--prod` command-line argument
	environment: argv.prod ? 'production' : undefined

};

// Build logger
var log = new Logger(sailsOptions.log);



// Interpret arguments
util.interpretArguments( argv, {


	/**
	 * Create a new project
	 */
	new: function () {
		sails.log.error('Sorry, `sails new` is currently out of commission.');
		process.exit(1);
	},





	/**
	 * Generate module(s)
	 */
	generate: function () {
		sails.log.error('Sorry, `sails generate` is currently out of commission.');
		process.exit(1);
	},





	/**
	 * Start the REPL
	 */
	console: function () {
		var sails = new Sails();
		sails.load({
			hooks: false,
			globals: false
		}, function (err) {
			if (err) return Err.fatal.failedToLoadSails(err);

			var appID		= _.str.capitalize(path.basename(process.cwd())),
				appName		= _.str.capitalize(appID);

			console.log();
			log('Welcome to the Sails console (v' + sails.version + ')');
			log('( to exit, type <CTRL>+<C> )');
			log.verbose('Lifting `'+process.cwd()+'` in interactive mode...');

			// Hide ship log to keep from dirtying up REPL
			sailsOptions.log = {noShip: true};
			sails.lift(sailsOptions, function (err) {
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
	 * Issue a command/instruction
	 */
	run: function () {
		sails.log.error('Sorry, `sails run` is currently out of commission.');
		process.exit(1);
	},





	/**
	 * Build a www directory from the assets folder
	 */
	www: function () {
		var wwwPath = path.resolve( process.cwd(), './www' ),
			wwwTaskName = 'build';

		log.info('Compiling assets into standalone `www` directory with `grunt ' + wwwTaskName + '`...');

		var sails = new Sails();
		sails.load({
			hooks: {
				grunt: false
			},
			globals: false
		}, function sailsReady (err) {
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
	 * Output the version of the currently running Sails
	 */
	version: function () {
		var sails = new Sails();
		sails.load( {
			hooks: false,
			globals: false
		}, function (err) {
			if (err) return Err.fatal.failedToLoadSails(err);
			log.info('v' + sails.version);
		});
	},




	/**
	 * Start up the app in the current directory.
	 */
	lift: function () {
		require('./lift')(sailsOptions);
	},
	



	
	/**
	 * Unknown command-- print out usage.
	 */
	invalid: function (cmd) {
		var userInput = cmd ? '`sails ' + cmd + '`' : 'that';
		log.error('Sorry, I don\'t understand what ',userInput,' means.');
		log.error( 'To get help using the Sails command-line tool, run `sails`.');
		console.log('');
	},




	/**
	 * sails` was run with no arguments-- print welcome message and usage info.
	 */
	sails: function () {
		var sails = new Sails();
		sails.load( {
			hooks: false,
			globals: false
		}, function (err) {
			if (err) return Err.fatal.failedToLoadSails(err);
			console.log('');
			log.info('Welcome to Sails! (v' + sails.version + ')');
			log.info( util.getUsage() );
			console.log('');
		});
	}
});








// Disable all hooks to decrease load time
// hooks: false


// // 'New up' a Sails
// var sails	= new Sails();

// // Load sails
// sails.load(sailsOptions, function sailsLoaded (err) {
// 	if (err) throw new Error(err);


// 	});
// });







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

	// 		// Figure out attributes based on args
	// 		var modelOpts = _.extend({}, argv);
	// 		var args = argv._.splice(3);
	// 		modelOpts.attributes = [];
	// 		_.each(args, function (attribute, i) {
	// 			var parts = attribute.split(':');
	// 			if (!parts[1]) {
	// 				log.error('Please specify the type for attribute ' + (i + 1) + ' '' + parts[0] + ''.');
	// 				process.exit(1);
	// 			}
	// 			modelOpts.attributes.push({
	// 				name: parts[0],
	// 				type: parts[1].toUpperCase()
	// 			});
	// 		});

	// 		log.warn('For the record :: to serve the blueprint API for this model,');
	// 		log.warn('you\'ll also need to have an empty controller.');
	// 		generate.generateModel(entity, modelOpts);
	// 		log.info('Generated model for ' + entity + '!');
	// 	}

	// 	// Generate a controller
	// 	else if (argv._[1] === 'controller') {
	// 		verifyArg(2, 'Please specify the name for the new controller as the third argument.');

	// 		// Figure out actions based on args
	// 		var controllerOpts = _.clone(argv);
	// 		controllerOpts.actions = argv._.splice(3);
	// 		generate.generateController(argv._[2], controllerOpts);
	// 		log.info('Generated controller for ' + argv._[2] + '!');
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
