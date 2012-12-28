#!/usr/bin/env node

// Build sails object
sails = {};

// Get Sails logger
require('../lib/logger.js');

var ejs = require('ejs'),
	fs = require('fs'),
	util = require('util'),
	argv = require('optimist').argv,
	_ = require('underscore');
_.str = require('underscore.string');

// Locate app root
var appRoot = '.';
var outputPath = '.';



// Generate a file
if(argv._[0] === 'generate') {

	// Generate a model
	if(argv._[1] === 'model') {
		verifyArg(2, "ERROR: Please specify the name for the new model as the third argument.");
		generate('model.js', "models/", argv._[2], ".js", true);
	}

	// Generate a controller
	else if(argv._[1] === 'controller') {
		verifyArg(2, "ERROR: Please specify the name for the new controller as the third argument.");
		generate('controller.js', "controllers/", argv._[2], "Controller.js", true);
	}

	// Generate a new view
	else if(argv._[1] === 'view') {
		verifyArg(2, "ERROR: Please specify the name for the new view as the third argument.");
		generate('view.ejs', "views/", argv._[2], '.ejs');
	}

	// Generate a new component
	else if(argv._[1] === 'component') {
		verifyArg(2, "ERROR: Please specify the name for the new component as the third argument.");
		generate('component.js', "mast/components/", argv._[2], '.js', true);
	}

	// Generate a new template
	else if(argv._[1] == 'template') {
		verifyArg(2, "ERROR: Please specify the name for the new template as the third argument.");
		generate('template.ejs', "mast/templates/", argv._[2], '.ejs');
	}

	// Otherwise generate a model, controller, and view directory
	else {
		verifyArg(1, "ERROR: Please specify the name of the entity to generate a model, controller, and view for as the second argument.");
		console.log("Generating model, controller, and view directory for "+argv._[1]);
		generate('model.js', "models/", argv._[1], ".js", true);
		generate('controller.js', "controllers/", argv._[1], "Controller.js", true);
		generateDir("views/" + argv._[1]);
	}
}

// Generate an app
else {
	console.log("\nGenerating sails project...");
	verifyArg(0, "ERROR: Please specify the name of the new directory as the first argument.");


	// If not an action, first argument == app name
	outputPath = outputPath + "/" + argv._[0];
	verifyDoesntExist(outputPath,"ERROR: A file or directory already exists at: "+outputPath);
	

	// Create core sails structure
	generateDir();
	generateDir("models");
	generateDir("controllers");
	generateDir("views");
	generateDir("policies");
	generateDir("services");

	// Create driver file
	generateFile('app.js', 'app.js');

	// Create routes file
	generateFile('routes.js', 'routes.js');

	// Create access_control file
	generateFile('access_control.js', 'access_control.js');

	// Create layout file
	generateFile('layout.ejs', 'views/layout.ejs');

	// Create meta controller and views
	generateFile('MetaController.js', 'controllers/MetaController.js');
	generateDir("views/meta");
	generateFile('home.ejs', 'views/meta/home.ejs');

	// Create static assets
	generateDir("public");
	generateDir("public/images");
	copyFile('bg.png', "public/images/bg.png");
	// generateDir("public/stylesheets");
	// generateDir("public/js");

	// Create rigging assets
	generateDir("public/dependencies");
	generateDir("public/ui");
	generateDir("public/ui/components");
	generateDir("public/ui/templates");
	generateDir("public/ui/stylesheets");
	generateFile('reset.css', "public/ui/stylesheets/reset.css");
	generateFile('layout.css', "public/ui/stylesheets/layout.css");

	// Create default policies
	generateFile('policies/authenticated.js', 'policies/authenticated.js');
	// generateFile('policies/only.js', 'policies/only.js');


	// Create readme files
	generateFile('__readme_models.md', "models/__readme.md");
	generateFile('__readme_controllers.md', "controllers/__readme.md");
	generateFile('__readme_views.md', "views/__readme.md");
	generateFile('__readme_services.md', "services/__readme.md");
}


// Generate a file

function generateFile(blueprintPath, newPath) {
	var file = fs.readFileSync(__dirname + '/blueprints/' + (blueprintPath || ""), 'utf8');
	fs.writeFileSync(outputPath + '/' + (newPath || ""), file);
}

// Generate a directory

function generateDir(newPath) {
	console.log("Generating directory "+newPath+"...");
	fs.mkdirSync(outputPath + "/" + (newPath || ""));
}


// Utility class to generate a file given the blueprint and output paths,
// as well as an optional ejs render override.

function generate(blueprintPath, prefix, entity, suffix, isEntityCapitalized) {
	console.log("Generating "+blueprintPath+" for "+entity+"...");

	if (!entity) {
		throw new Error('No output file name specified!');
	}

	var entityName = isEntityCapitalized ? _.str.capitalize(entity) : entity,
		file = fs.readFileSync(__dirname + "/blueprints/" + blueprintPath, 'utf8');
	file = ejs.render(file, {
		name: entityName
	});
	fs.writeFileSync(outputPath + "/" + prefix + entityName + suffix, file);
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
		console.log(msg);
		process.exit();
	}
}

function verifyDoesntExist(path,msg) {
	if (fileExists(outputPath)) {
		console.log(msg);
		process.exit();
	}
}

// Check if a file or directory exists
function fileExists (path) {
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