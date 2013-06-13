#!/usr/bin/env node

// Build sails instance
var sails = require('../lib');
sails.config = {
	appPath: process.cwd()
};
require('../lib/configuration')(sails).load(function (err) {
	if (err) throw new Error(err);


	// Dependencies
	var _			= require('lodash'),
		utils		= require('./utils.js')(sails),
		fs			= utils.fs,
		generate	= require('./generate.js')(sails),
		argv		= require('optimist').argv,
		newSailsApp = require('./new.js')(sails);



	// If coffeescript is not installed, fail silently
	try {
		require('coffee-script');
		sails.log.verbose('Enabling CoffeeScript...');
	}
	catch (e) {
		sails.log.verbose('CoffeeScript not installed.');
	}

	// Stringify args
	argv._ = _.map(argv._, function(arg) {
		return arg + '';
	});

	// Known errors
	var errors = {
		badLocalSails: function(requiredVersion) {
			return 'You may consider reinstalling Sails locally (npm install sails@' + requiredVersion + ').';
		}
	};

	// Read package.json file in specified path
	function getPackage(path) {
		path = require('underscore.string').rtrim(path, '/');
		var packageJson = fs.readFileSync(path + '/package.json', 'utf-8');
		try {
			packageJson = JSON.parse(packageJson);
		} catch (e) {
			return false;
		}
		return packageJson;
	}



	// Start this app
	if (argv._[0] && _.contains(['lift', 'raise', 'launch', 'start', 'server', 'run', 's', 'l'], argv._[0])) {

		require('./lift.js')(sails)(argv);
	}




	// Check if console was requested, if so, launch console
	else if (_.contains(['console'], argv._[0])) {
		sails.log.ship();
		sails.log('Welcome to Sails (v'+sails.version +')');
		sails.log('( to exit, type <CTRL>+<C> )');

		// TODO: instead of lifting the servers, just fire up the ORM and include all the modules

		sails.lift({
			log: {
				level: 'silent'
			}
		}, function () {
			repl = require("repl").start("sails> ");
			repl.on('exit', function() {
				sails.log.verbose('Closing console');
				process.exit();
			});
		});

		return;
	}



	// Check for newer version and upgrade if available.
	else if (_.contains(['upgrade'], argv._[0])) {
		var sys = require('sys');
		var exec = require('child_process').exec;
		var child;
		var http = require('http');
		var newest;
		var current;
		var options = {
			host: 'registry.npmjs.org',
			port: 80,
			path: '/sails'
		};
		http.get(options, function(res) {
			var jsond = '';
			var body = '';
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function () {
				jsond = JSON.parse(body);
				if (jsond['dist-tags'].latest > sails.version) {
					// executes `pwd`
					child = exec("npm install sails@" + jsond['dist-tags'].latest, function (error, stdout, stderr) {
						if (error !== null) {
							console.log('exec error: ' + error);
						}
						console.log("Upgrade Complete:  You are now on Sails Version: "+jsond['dist-tags'].latest);
					});
				} else {
					console.log("Already Up To Date");
				}
			});
		}).on('error', function(e) {
			console.error(e);
		});
	}



	// Get the sails version
	else if (argv.v || argv.version || (argv._[0] && _.contains(['v', 'version'], argv._[0]))) {
		sails.log.info('v' + sails.version);
	}




	// Basic usage
	else if (argv._.length === 0) {
		console.log('');
		sails.log('Welcome to Sails! (v'+sails.version + ')');
		console.log('');
		sailsUsage();
	}



	// Generate file(s)
	else if (argv._[0] && (argv._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/) || argv.g || argv.generate)) {

		verifyArg(1, 'Please specify the name for the new model and controller as the second argument.');


		// Generate a model
		if (argv._[1] === 'model') {
			var entity = argv._[2];
			verifyArg(2, 'Please specify the name for the new model as the third argument.');

			// Figure out attributes based on args
			var options = _.extend({}, argv);
			var args = argv._.splice(3);
			options.attributes = [];
			_.each(args,function(attribute,i){
				var parts = attribute.split(':');
				if (!parts[1]) {
					sails.log.error('Please specify the type for attribute '+(i+1)+ ' "'+parts[0]+'".');
					process.exit(1);
				}
				options.attributes.push({
					name: parts[0],
					type: parts[1].toUpperCase()
				});
			});

			sails.log.warn('In order to serve the blueprint API for this model, you must now also generate an empty controller.');
			sails.log.warn('If you want this behavior, run \'sails generate controller '+ entity +'\' to create a blank controller.');
			generate.generateModel(entity, options);
		}

		// Generate a controller
		else if (argv._[1] === 'controller') {
			var entity = argv._[2];
			verifyArg(2, 'Please specify the name for the new controller as the third argument.');

			// Figure out actions based on args
			var options = _.extend({}, argv);
			options.actions = argv._.splice(3);

			generate.generateController(entity, options);
		}

		// // Generate a view
		// else if(argv._[1] === 'view') {
		// 	var entity = argv._[2];
		// 	verifyArg(2, "Please specify the name for the new view as the third argument.");
		// 	// Figure out actions based on args
		// 	var options = _.extend({},argv);
		// 	options.actions = argv._.splice(3);
		// 	generate.generateView(entity, options);
		// }

		// Generate an adapter
		else if (argv._[1] === 'adapter') {
			var entity = argv._[2];
			verifyArg(2, "Please specify the name for the new argument as the third argument.");

			// Figure out attributes based on args
			var options = _.extend({}, argv);
			generate.generateAdapter(entity, options);
		}
		// Otherwise generate a model and controller
		else {
			var entity = argv._[1];
			verifyArg(1, "Please specify the name of the entity as the second argument to generate a model, controller, and view.");
			sails.log.info("Generating model and controller for " + entity);

			var options = _.extend({}, argv);
			options.actions = argv._.splice(2);

			generate.generateModel(entity, options);
			generate.generateController(entity, options);
		}
	}



	// Create a new app
	// second argument == app name
	else if (argv._[0].match(/^new$/)) {

		verifyArg(1, "Please specify the name of the new project directory to create: e.g.\n sails new <appName>");

		// Default to ejs templates for new projects, but allow user to override with --template
		var template = 'ejs';
		if (argv.template) {
			template = argv.template;
		}
		newSailsApp(argv._[1], template);
	}


	// Build a www directory of everyting from /.tmp/public (aka /assets)
	else if (argv._[0].match(/^build$/)) {
		return sails.build();
	}


	// Unknown command, print out usage
	else {
		console.log('');
		sailsUsage();
		sails.log.error (argv._[0] + ' is not a valid action.');
	}




	// Display usage
	function sailsUsage() {
		function leftColumn (str) {
			var n = (33-str.length);
			return str + require('underscore.string').repeat(' ',n);
		}

		var usage = 'Usage: sails <command>\n\n';
		usage += leftColumn('sails lift') + 'Run this Sails app (in the current dir)\n';
		usage += leftColumn('  [--dev]') + 'with development environment specified \n';
		usage += leftColumn('  [--prod]') + 'with production environment specified \n';
		usage += leftColumn('sails console') + 'Run this Sails app (in the current dir & in interactive mode.)\n';
		usage += leftColumn('sails new <appName>') + 'Create a new Sails project in the current dir\n';
		usage += leftColumn('sails generate <foo>') + 'Generate api/models/Foo.js and api/controllers/FooController.js\n';
		usage += leftColumn('sails generate model <foo>') + 'Generate api/models/Foo.js\n';
		usage += leftColumn('sails generate controller <foo>') + 'Generate api/controllers/FooController.js\n';
		usage += leftColumn('sails version') + 'Get the current globally installed Sails version';

		sails.log.info(usage);
	}


	// Verify that an argument exists
	function verifyArg(argNo, msg) {
		if (!argv._[argNo]) {
			sails.log.error(msg);
			process.exit(1);
		}
	}


});


