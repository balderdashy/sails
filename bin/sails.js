#!/usr/bin/env node

var ejs = require('ejs'),
	fs = require('fs'),
	util = require('util');

var argv = require('optimist').argv;

// Locate app root
var appRoot = '.';
var outputPath = '.';



// Generate a file
if(argv._[0] === 'generate') {

	// Generate a model
	if(argv._[1] === 'model') {
		verifyArg(2,"ERROR: Please specify the name for the new model as the third argument.");
		generate('model.js', "models/",".js", true);
	}

	// Generate a controller
	else if(argv._[1] === 'controller') {
		verifyArg(2,"ERROR: Please specify the name for the new controller as the third argument.");
		generate('controller.js', "controllers/" , "Controller.js", true);
	}

	// Generate a new layout file
	else if(argv._[1] === 'layout') {
		generateFile('layout.ejs', "views/", 'layout.ejs');
	}

	// Generate a new view
	else if(argv._[1] === 'view') {
		verifyArg(2,"ERROR: Please specify the name for the new view as the third argument.");
		generate('view.ejs', "views/", '.ejs');
	}

	// Generate a new component
	else if(argv._[1] === 'component') {
		verifyArg(2,"ERROR: Please specify the name for the new component as the third argument.");
		generate('component.js', "mast/components/", '.js',true);
	}

	// Generate a new template
	else if(argv._[1] == 'template') {
		verifyArg(2,"ERROR: Please specify the name for the new template as the third argument.");
		generate('template.ejs', "mast/templates/", '.ejs');
	}
}

// Generate an app
else {
	console.log("\nGenerating sails project...");
	verifyArg(0,"ERROR: Please specify the name of the new directory as the first argument.");
	

	// If not an action, first argument == app name
	outputPath = outputPath + "/" + argv._[0];

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
	generateDir("public/stylesheets");
	generateDir("public/js");
	generateFile('reset.css', "public/stylesheets/reset.css");
	generateFile('layout.css', "public/stylesheets/layout.css");
	copyFile('bg.png', "public/images/bg.png");

	// Create structure for Mast
	generateDir("mast");
	generateDir("mast/components");
	generateDir("mast/routes");
	generateDir("mast/templates");
	generateDir("mast/models");

	// Create default policies
	generateFile('policies/authenticated.js', 'policies/authenticated.js');
	generateFile('policies/only.js', 'policies/only.js');


	// Create readme files
	generateFile('__readme_models.md', "models/__readme.md");
	generateFile('__readme_controllers.md', "controllers/__readme.md");
	generateFile('__readme_views.md', "views/__readme.md");
	generateFile('__readme_mast.md', "mast/__readme.md");
	generateFile('__readme_mast_components.md', "mast/components/__readme.md");
	generateFile('__readme_mast_models.md', "mast/models/__readme.md");
	generateFile('__readme_mast_routes.md', "mast/routes/__readme.md");
	generateFile('__readme_mast_templates.md', "mast/templates/__readme.md");
	generateFile('__readme_js.md', "public/js/__readme.md");
	generateFile('__readme_stylesheets.md', "public/stylesheets/__readme.md");
	generateFile('__readme_services.md', "services/__readme.md");
}


// Generate a file

function generateFile(blueprintPath, newPath) {
	var file = fs.readFileSync(__dirname + '/blueprints/' + (blueprintPath || ""), 'utf8');
	fs.writeFileSync(outputPath + '/' + (newPath || ""), file);
}

// Generate a directory

function generateDir(newPath) {
	fs.mkdirSync(outputPath + "/" + (newPath || ""));
}


// Utility class to generate a file given the blueprint and output paths,
// as well as an optional ejs render override.

function generate(blueprintPath, prefix,suffix, isEntityCapitalized) {
	if(!argv._[2]) {
		throw new Error('No output file name specified!');
	}

	var entityName = isEntityCapitalized ? _.str.capitalize(argv._[2]) : argv._[2],
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
function verifyArg (argNo,msg) {
	if (! argv._[argNo]) {
		console.log(msg);
		process.exit();
	}
}

function verify1stArg () {

}