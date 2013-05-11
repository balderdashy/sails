#!/usr/bin/env node

// Dependencies
var _ = require('underscore');
_.str = require('underscore.string');
var ejs = require('ejs');
var fs = require('fs-extra');
var util = require('util');
var forever = require('forever');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

var argv = require('optimist').argv;
require('coffee-script');

// Build mock sails object
var sails = require('./mockSails.js');

// Output in directory where cmdline tool was run
var outputPath = '.';

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
	path = _.str.rtrim(path, '/');
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

	var localSailsPath = sails.config.appPath + '/node_modules/sails';

	// Check project package.json for sails.js dependency version and
	// If no package.json file exists, don't try to start the server
	if (fs.existsSync(sails.config.appPath + '/package.json')) {
		appPackageJson = getPackage(sails.config.appPath);
	} else {
		sails.log.error('Cannot read package.json in the current directory.  ' +
			'It could be missing or corrupt.  ' +
			'Are you sure this is a sails app?');
		process.exit(1);
	}

	// If sails dependency unspecified, allow anything, but throw a warning
	var requiredSailsVersion = 0;
	if (!(appPackageJson.dependencies && appPackageJson.dependencies.sails)) {
		sails.log.warn('The app in the current directory does not list sails as a dependency.');
	} else {
		requiredSailsVersion = appPackageJson.dependencies && appPackageJson.dependencies.sails;
	}

	// check if node_modules/sails exists in current directory
	if (fs.existsSync(localSailsPath)) {

		// check package.json INSIDE local install of Sails
		// No package.json means local sails means it must be corrupted
		if (!fs.existsSync(localSailsPath + '/package.json')) {
			sails.log.error('Locally installed Sails.js has corrupted or missing package.json file.');
			sails.log.error(errors.badLocalSails(requiredSailsVersion));
			process.exit(1);
		}

		// Read package.json to detect version
		var localSailsPackage = fs.readFileSync(localSailsPath + '/package.json', 'utf-8');
		try {
			localSailsPackage = JSON.parse(localSailsPackage);
		} catch (e) {
			sails.log.error('Unable to parse package.json in local node_modules/sails!\n');
			sails.log.error(errors.badLocalSails(requiredSailsVersion));
			process.exit(1);
		}

		// Error out if it has the wrong version in its package.json

		// TODO: use npm's native version comparator
		if (requiredSailsVersion !== localSailsPackage.version) {
			sails.log.error('This app specifies Sails version ' + requiredSailsVersion + ', but local node_modules/sails version is ' + localSailsPackage.version);
			sails.log.error(errors.badLocalSails(requiredSailsVersion));
		}


		// If we made it this far, we're good to go-- fire 'er up, chief
		require(sails.config.appPath + '/node_modules/sails/lib/sails.js').lift(argv);

	}
	// otherwise, copy the global installation of sails locally
	else {
		var globalSailsPath = __dirname + '/../';
		require('../lib/sails').lift(argv);

		// sails.log.verbose("Installing Sails in this project...");
		// fs.mkdirsSync(localSailsPath);
		// fs.copy(globalSailsPath, localSailsPath, function(err) {
		// 	if(err) throw new Error(err);
		// });
	}
}
// // Daemonize server
// else if(argv.d || argv._[0] && _.contains(['forever'], argv._[0])) {
// 	var forever = require('forever');
// 	forever.startServer();
// 	forever.startDaemon('sails lift');

// 	// Create temporary app file
// 	// fs.writeFileSync(sails.config.appPath + '/app.js', function (){});
// 	// copy down global install of sails locally if one doesn't already exist
// 	// if(!fs.existsSync(sails.config.appPath + '/node_modules/sails')) {}

// 	// run file
// }
// // Stop all servers
// else if(argv._[0] && _.contains(['stop', 'kill'], argv._[0])) {

// }


// Check if console was requested, if so, launch console
else if (_.contains(['console'], argv._[0])) {
	sails.log.ship();
	sails.log('Welcome to Sails (v'+sails.version +')');
	sails.log('( to exit, type <CTRL>+<C> )');

	require('../lib/sails').lift({
		log: {
			level: 'silent'
		}
	}, function() {
		repl = require("repl").start("sails> ");
		repl.on('exit', function() {
			sails.log.verbose('Closing console');
			process.exit();
		});
	});
	return; //exit before accidently starting a second sails.
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
		generateModel(entity, options);
	}

	// Generate a controller
	else if (argv._[1] === 'controller') {
		var entity = argv._[2];
		verifyArg(2, 'Please specify the name for the new controller as the third argument.');

		// Figure out actions based on args
		var options = _.extend({}, argv);
		options.actions = argv._.splice(3);

		generateController(entity, options);
	}

	// // Generate a view
	// else if(argv._[1] === 'view') {
	// 	var entity = argv._[2];
	// 	verifyArg(2, "Please specify the name for the new view as the third argument.");
	// 	// Figure out actions based on args
	// 	var options = _.extend({},argv);
	// 	options.actions = argv._.splice(3);
	// 	generateView(entity, options);
	// }
	
	// Generate an adapter
	else if (argv._[1] === 'adapter') {
		var entity = argv._[2];
		verifyArg(2, "Please specify the name for the new argument as the third argument.");

		// Figure out attributes based on args
		var options = _.extend({}, argv);
		generateAdapter(entity, options);
	}
	// Otherwise generate a model and controller
	else {
		var entity = argv._[1];
		verifyArg(1, "Please specify the name of the entity as the second argument to generate a model, controller, and view.");
		sails.log.info("Generating model and controller for " + entity);

		var options = _.extend({}, argv);
		options.actions = argv._.splice(2);

		generateModel(entity, options);
		generateController(entity, options);
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
	createNewApp(argv._[1], template);
}

// Unknown command, print out usage
else {
	console.log('');
	sailsUsage();
	sails.log.error (argv._[0] + ' is not a valid action.');
}

function createNewApp(appName, templateLang) {
	// Whether the project being made in an existing directory or not
	var existingDirectory;

	// If app is being created inside the current directory
	if (appName === '.') {

		// The app name is the current directory name
		appName = _.last(process.cwd().split('/'));

		// Set the current directory to the parent directory of the new app
		process.chdir('../');

		// This will be checked to determine if a new app directory needs to be made
		existingDirectory = true;
	}

	// Check if the appName is an absolute path, if so don't prepend './'
	if (appName.substr(0, 1) === '/') {
		outputPath = appName;
	} else {
		outputPath = outputPath + '/' + appName;
	}

	// If app is being created in new directory
	if (!existingDirectory) {

		// Check if there is a directory in the current directory with the new
		// app name, log and exit if there is
		verifyDoesntExist(outputPath, 'A file or directory already exists at: ' + outputPath);

		// Create a directory with the specified app name
		generateDir();
	}

	sails.log.info('Generating Sails project (' + appName + ')...');

	// Create default app structure
	copyBoilerplate('public', 'public');
	copyBoilerplate('assets', 'assets');
	copyBoilerplate('api', 'api');
	copyBoilerplate('config', 'config');

	// Different stuff for different view engines
	if (templateLang === 'handlebars') templateLang = 'hbs';

	copyBoilerplate('views/' + templateLang, 'views');

	var viewConfig = {
		viewEngine: templateLang
	};

	if (templateLang === 'jade' || templateLang === 'haml') {
		viewConfig.layout = false;
	}

	fs.createFileSync(outputPath + '/config/views.js');
	fs.writeFileSync(outputPath + '/config/views.js', 'module.exports = ' +
		JSON.stringify(viewConfig , null, '\t').split('"').join('\'') + ';');


	// Default app launcher file (for situations where sails lift isn't good enough)
	generateFile('app.js', 'app.js');

	// Create .gitignore
	generateFile('gitignore', '.gitignore');

	// Generate package.json
	sails.log.debug('Generating package.json...');
	fs.writeFileSync(outputPath + '/package.json', JSON.stringify({
		name: appName,
		'private': true,
		version: '0.0.0',
		description: 'a Sails application',
		dependencies: {
			sails: sails.version,
			'optimist': '0.4.0'
		},
		scripts: {
			// Include this later when we have "sails test" ready.
			// test: './node_modules/mocha/bin/mocha -b',
			start: 'node app.js',
			debug: 'node debug app.js'
		},
		main: 'app.js',
		repository: '',
		author: '',
		license: 'MIT'
	}, null, 4));

	// Generate README
	sails.log.debug('Generating README.md...');
	fs.writeFileSync(outputPath + '/README.md', '# ' + appName + '\n### a Sails application');
}


// Display usage
function sailsUsage() {
	function leftColumn (str) {
		var n = (33-str.length);
		return str + _.str.repeat(' ',n);
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


// Generate a file
function generateFile(boilerplatePath, newPath) {
	var fullBpPath = __dirname + '/boilerplates/' + (boilerplatePath || '');
	var file = fs.readFileSync(fullBpPath, 'utf8');
	var newFilePath = outputPath + '/' + (newPath || '');
	verifyDoesntExist(newFilePath, 'A file/directory already exists at ' + newFilePath);

	// Touch output file to make sure the path to it exists
	if (fs.createFileSync(newFilePath)) {
		sails.log.error('Could not create file, ' + newFilePath + '!');
		process.exit(1);
	}
	fs.writeFileSync(newFilePath, file);
}

// Generate a directory
function generateDir(newPath, gitkeep) {
	if (!newPath) {
		sails.log.debug('Generating app directory...');
	} else {
		sails.log.debug('Generating directory ' + newPath + '...');
	}
	var newDirPath = outputPath + '/' + (newPath || '');
	verifyDoesntExist(newDirPath, 'A file/directory already exists at ' + newDirPath);
	fs.mkdirSync(newDirPath);
	// If directory will be empty, create a .gitkeep in it
	if (gitkeep) {
		generateFile('.gitkeep', newPath + '/.gitkeep');
	}
}

function generateController(entity, options) {
	var newControllerPath = sails.config.paths.controllers + '/' + capitalize(entity) + 'Controller.js';
	var newFederatedControllerPath = sails.config.paths.controllers + '/' + entity;

	verifyDoesntExist(newControllerPath, "A controller already exists at: " + newControllerPath);
	verifyDoesntExist(newFederatedControllerPath, "A controller already exists at: " + newFederatedControllerPath);

	// Federated controller
	if (options && (options.f || options.federated)) {

		generateDir(newFederatedControllerPath);
		_.each(options.actions, function(action) {

			action = verifyValidEntity(action, "Invalid action name: " + action);

			return generate({
				boilerplate: 'federatedAction.ejs',
				prefix: sails.config.paths.controllers + '/' + entity,
				entity: entity,
				action: action,
				viewEngine: sails.config.viewEngine,
				viewPath: _.str.rtrim(sails.config.paths.views, '/'),
				baseurl: '/' + entity,
				suffix: ".js"
			});
		});
	}
	// Monolithic controller
	else {
		var actions = "";

		// Add each requested function
		if (options && options.actions) {
			_.each(options.actions, function(action) {
				var fnString = renderBoilerplateTemplate('action.ejs', {
					action: action,
					entity: entity,
					viewEngine: sails.config.viewEngine,
					viewPath: _.str.rtrim(sails.config.paths.views, '/'),
					baseurl: '/' + entity
				});

				// If this is not the first action, add a comma
				if (actions !== "") {
					fnString = ',\n\n' + fnString;
				}
				actions += fnString;
			});
		}
		return generate({
			boilerplate: 'controller.ejs',
			prefix: sails.config.paths.controllers,
			entity: capitalize(entity),
			actions: actions,
			suffix: "Controller.js"
		});
	}
}

function generateModel(entity, options) {
	var attributes = "";

	// Add each requested attribute
	if (options && options.attributes) {
		_.each(options.attributes, function(attribute) {
			attribute.name = verifyValidEntity(attribute.name, "Invalid attribute: " + attribute.name);

			var fnString = renderBoilerplateTemplate('attribute.ejs', {
				attribute: attribute,
				entity: entity,
				viewEngine: sails.config.viewEngine,
				viewPath: _.str.rtrim(sails.config.paths.views, '/'),
				baseurl: '/' + entity
			});

			// If this is not the first attribute, add a comma
			if (attributes !== "") {
				fnString = ',\n\n' + fnString;
			}
			attributes += fnString;
		});
	}
	return generate({
		boilerplate: 'model.ejs',
		prefix: sails.config.paths.models,
		entity: capitalize(entity),
		attributes: attributes,
		suffix: ".js"
	});
}

function generateAdapter(entity, options) {
	return generate({
		boilerplate: 'adapter.ejs',
		prefix: sails.config.paths.adapters,
		entity: capitalize(entity),
		suffix: "Adapter.js"
	});
}

function generateView(entity, options) {
	var viewPath = sails.config.paths.views + '/' + entity;
	generateDir(viewPath);

	_.each(options.actions, function(action) {
		action = verifyValidEntity(action, "Invalid view name: " + action);

		return generate({
			boilerplate: 'view.' + sails.config.viewEngine,
			prefix: viewPath,
			entity: entity,
			action: action,
			suffix: '.' + sails.config.viewEngine
		});
	});
}


// Utility class to generate a file given the boilerplate and output paths,
// as well as an optional ejs render override.


function generate(options) {
	var boilerplateName = options.boilerplate.split('.')[0];
	sails.log.debug('Generating ' + boilerplateName + ' for ' + options.entity + '...');

	// Trim slashes
	options.prefix = _.str.rtrim(options.prefix, '/') + '/';

	if (!options.entity) {
		throw new Error('No output file name specified!');
	}

	var file = renderBoilerplateTemplate(options.boilerplate, options);

	var fileEntity = options.action || options.entity;
	var newFilePath = options.prefix + fileEntity + options.suffix;
	verifyDoesntExist(newFilePath, 'A file or directory already exists at: ' + newFilePath);

	// Touch output file to make sure the path to it exists
	if (fs.createFileSync(newFilePath)) {
		sails.log.error('Could not create file, ' + newFilePath + '!');
		process.exit(1);
	}
	fs.writeFileSync(newFilePath, file);
}

// Read a boilerplate and render the template


function renderBoilerplateTemplate(boilerplate, data) {
	var boilerplatePath = __dirname + '/boilerplates/templates/' + boilerplate;
	verifyExists(boilerplatePath, "Boilerplate (" + boilerplate + ") doesn't exist!");
	var file = fs.readFileSync(boilerplatePath, 'utf8');
	return ejs.render(file, data);
}

// Copy a boilerplate file


function copyBoilerplate(boilerplate, destination, cb) {
	var boilerplatePath = __dirname + '/boilerplates/' + boilerplate;
	fs.copy(boilerplatePath, outputPath + '/' + destination, function(err) {
		return cb && cb(err);
	});
}


// Verify that an argument exists


function verifyArg(argNo, msg) {
	if (!argv._[argNo]) {
		sails.log.error(msg);
		process.exit(1);
	}
}

function verifyDoesntExist(path, msg) {
	if (fileExists(path)) {
		sails.log.error(msg);
		process.exit(1);
	}
}

function verifyExists(path, msg) {
	if (!fileExists(path)) {
		sails.log.error(msg);
		process.exit(1);
	}
}

function verifyValidEntity(entity, msg) {
	if (!isValidECMA51Variable(entity)) {
		sails.log.error(msg);
		process.exit(1);
	} else {
		return entity;
	}
}

function isValidECMA51Variable(v) {
	return v.match(/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/);
}

// Check if a file or directory exists

function fileExists(path) {
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
}



// String convenience utilities

function trimSlashes(str) {
	return _.str.trim(str, '/');
}

function capitalize(str) {
	return _.str.capitalize(str);
}
