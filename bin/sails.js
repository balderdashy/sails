#!/usr/bin/env node

// Dependencies
var _ = require('underscore');
_.str = require('underscore.string');
var ejs = require('ejs');
var fs = require('fs');
var util = require('util');

var optimist = require('optimist');
var argv = optimist.argv;


// Build sails object
sails = {};

// Get Sails logger
sails.log = require('../lib/logger.js')();

// Locate app root
var appRoot = '.';
var outputPath = '.';



// Generate a file
if(argv._[0] === 'generate') {

	verifyArg(1, "ERROR: Please specify the name for the new model and controller as the second argument.");

	// Generate a model
	if(argv._[1] === 'model') {
		var entity = argv._[2];
		verifyArg(2, "ERROR: Please specify the name for the new model as the third argument.");
		generateModel(entity);
	}

	// Generate a controller
	else if(argv._[1] === 'controller') {
		var entity = argv._[2];
		verifyArg(2, "ERROR: Please specify the name for the new controller as the third argument.");
		generateController(entity);
	}

	// Otherwise generate a model, controller, and view directory
	else {
		var entity = argv._[1];
		verifyArg(1, "ERROR: Please specify the name of the entity to generate a model, controller, and view for as the second argument.");
		sails.log.info("Generating model and controller for " + entity);
		generateModel(entity);
		generateController(entity);
	}
}

// Generate an app
else {
	sails.log.info("Generating Sails project...");
	verifyArg(0, "ERROR: Please specify the name of the new project directory as the first argument.");

	// If not an action, first argument == app name
	var appName = argv._[0];
	outputPath = outputPath + "/" + appName;
	verifyDoesntExist(outputPath, "ERROR: A file or directory already exists at: " + outputPath);


	// Create core sails structure
	generateDir();
	generateDir("models");
	generateDir("controllers");
	generateDir("views");
	generateDir("middleware");

	// Create driver file
	generateFile('app.js', 'app.js');

	// Create routes file
	generateFile('routes.js', 'routes.js');

	// Create policy file
	generateFile('policy.js', 'policy.js');

	// Create layout file
	generateFile('layout.ejs', 'views/layout.ejs');

	// Create meta controller and views
	generateDir("views/meta");
	generateFile('home.ejs', 'views/meta/home.ejs');

	// Create static assets
	generateDir("public");
	generateDir("public/images");
	copyFile('bg.png', "public/images/bg.png");

	// Create rigging assets
	generateDir("public/dependencies");
	generateDir("public/js");
	generateDir("public/templates");
	generateDir("public/styles");
	generateFile('reset.css', "public/styles/reset.css");
	generateFile('layout.css', "public/styles/layout.css");

	// Create default middleware
	generateFile('middleware/authenticated.js', 'middleware/authenticated.js');


	// Create readme files
	generateFile('__readme_models.md', "models/__readme.md");
	generateFile('__readme_controllers.md', "controllers/__readme.md");
	generateFile('__readme_views.md', "views/__readme.md");
	generateFile('__readme_middleware.md', "middleware/__readme_middleware.md");

	// Create .gitignore
	generateFile('.gitignore', '.gitignore');

	// Generate package.json
	sails.log.debug("Generating package.json...");
	fs.writeFileSync(outputPath + '/package.json', JSON.stringify({
		name: appName,
		version: '0.0.0',
		description: 'a Sails application',
		main: 'app.js',
		repository: '',
		author: '',
		license: 'MIT'
	}, null, 4));

	// Generate readme
	sails.log.debug("Generating README.md...");
	fs.writeFileSync(outputPath + '/README.md', '#' + appName + '\n### a Sails application');
}


// Generate a file

function generateFile(blueprintPath, newPath) {
	var file = fs.readFileSync(__dirname + '/blueprints/' + (blueprintPath || ""), 'utf8');
	fs.writeFileSync(outputPath + '/' + (newPath || ""), file);
}

// Generate a directory

function generateDir(newPath) {
	sails.log.debug("Generating directory " + newPath + "...");
	fs.mkdirSync(outputPath + "/" + (newPath || ""));
}

function generateController(entity, options) {
	return generate({
		blueprint: 'controller.js',
		prefix: 'controllers/',
		entity: capitalize(entity),
		suffix: "Controller.js"
	});
}
function generateModel(entity, options) {
	return generate({
		blueprint: 'model.js',
		prefix: 'models/',
		entity: capitalize(entity),
		suffix: ".js"
	});
}


// Utility class to generate a file given the blueprint and output paths,
// as well as an optional ejs render override.
function generate(options) {
	sails.log.debug("Generating " + options.blueprint + " for " + options.entity + "...");

	// Trim slashes
	options.prefix = trimSlashes(options.prefix) + '/';

	if(!options.entity) throw new Error('No output file name specified!');
	
	var blueprint = __dirname + "/blueprints/" + options.blueprint;
	verifyExists(blueprint, "Blueprint doesn't exist!");
	var file = fs.readFileSync(blueprint, 'utf8');

	file = ejs.render(file, {
		name: options.entity
	});

	var newFilePath = outputPath + "/" + options.prefix + options.entity + options.suffix;
	verifyDoesntExist(newFilePath, "ERROR: A file or directory already exists at: " + newFilePath);
	fs.writeFileSync(newFilePath, file);
}

// Copy a file from src to dst with callback cb

function copyFile(src, dst, cb) {
	function copy(err) {
		var is, os;

		if(!err) {
			return cb(new Error("File " + dst + " exists."));
		}

		fs.stat(__dirname + "/blueprints/" + src, function(err) {
			if(err) {
				return cb(err);
			}
			is = fs.createReadStream(src);
			os = fs.createWriteStream(dst);
			util.pump(is, os, cb);
		});
	}

	fs.stat(outputPath + "/" + dst, copy);
}

// Verify that an argument exists

function verifyArg(argNo, msg) {
	if(!argv._[argNo]) {
		sails.log.error(msg);
		process.exit();
	}
}

function verifyDoesntExist(path, msg) {
	if(fileExists(outputPath)) {
		sails.log.error(msg);
		process.exit();
	}
}

function verifyExists(path, msg) {
	if(!fileExists(path)) {
		sails.log.error(msg);
		process.exit();
	}
}

// Check if a file or directory exists
function fileExists(path) {
	try {
		// Query the entry
		var stats = fs.lstatSync(path);

		// Is it a directory?
		if(stats.isDirectory() || stats.isFile()) {
			return true;
		}
	} catch(e) {
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