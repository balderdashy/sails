#!/usr/bin/env node

var ejs = require('ejs'),
fs = require('fs'),
util = require('util');

fs.copy = function (src, dst, cb) {
    function copy(err) {
		var is
        , os
        ;

		if (!err) {
			return cb(new Error("File " + dst + " exists."));
		}

		fs.stat(src, function (err) {
			if (err) {
				return cb(err);
			}
			is = fs.createReadStream(src);
			os = fs.createWriteStream(dst);
			util.pump(is, os, cb);
		});
    }

    fs.stat(dst, copy);
};
  
  
//var argv = 
//	require('optimist').
//	usage('Usage: $0 generate FILETYPE [string] (NAME [string])').
//	demand(2).
//	argv;

var argv = require('optimist').argv;

// Locate app root
var appRoot = '.';
var outputPath = '.';

// Generate a file
if (argv._[0] == 'generate') {
	if (argv._[1] == 'model') { generate('/blueprints/model.js',outputPath,".js"); }
	else if (argv._[1] == 'controller') { generate('/blueprints/controller.js',outputPath,"Controller.js"); }
	else if (argv._[1] == 'layout') { 
		file = fs.readFileSync(__dirname+'/blueprints/layout.ejs','utf8');
		fs.writeFileSync(outputPath+"/layout.ejs",file);
	}
	else if (argv._[1] == 'view') { 
		if (!argv._[2]) {
			throw new Error ('No output file name specified!');
		}
		var entityName = argv._[2],
		file = fs.readFileSync(__dirname+'/blueprints/view.ejs','utf8');
		file = ejs.render(file,{name: entityName});
		fs.writeFileSync(outputPath+"/"+entityName+".ejs",file);
	}
}

// Generate an app
else {
	// If not an action, first argument == app name
	var newAppPath = outputPath+"/"+argv._[0];
	
	// Create core sails structure
	generateDir();
	generateDir("models");
	generateDir("controllers");
	generateDir("views");
	generateDir("policies");
	generateDir("services");

	// Create driver file
	generateFile('app.js','app.js');

	// Create routes file
	generateFile('routes.js','routes.js');
	
	// Create access_control file
	generateFile('access_control.js','access_control.js');
	
	// Create layout file
	generateFile('layout.ejs','views/layout.ejs');
	
	// Create meta controller and views
	generateFile('MetaController.js','controllers/MetaController.js');
	generateDir("views/meta");
	generateFile('home.ejs','views/meta/home.ejs');
	
	// Create static assets
	generateDir("public");
	generateDir("public/images");
	generateDir("public/stylesheets");
	generateDir("public/js");
	generateFile('reset.css',"public/stylesheets/reset.css");
	generateFile('layout.css',"public/stylesheets/layout.css");
	fs.copy(__dirname+'/blueprints/bg.png',newAppPath+"/public/images/bg.png");
	
	// Create structure for Mast
	generateDir("mast");
	generateDir("mast/components");
	generateDir("mast/routes");
	generateDir("mast/templates");
	generateDir("mast/models");

	// Create default policies
	generateFile('policies/authenticated.js','policies/authenticated.js');
	generateFile('policies/only.js','policies/only.js');
	
	
	// Create readme files
	generateFile('__readme_models.md',"models/__readme.md");
	generateFile('__readme_controllers.md',"controllers/__readme.md");
	generateFile('__readme_views.md',"views/__readme.md");
	generateFile('__readme_mast.md',"mast/__readme.md");
	generateFile('__readme_mast_components.md',"mast/components/__readme.md");
	generateFile('__readme_mast_models.md',"mast/models/__readme.md");
	generateFile('__readme_mast_routes.md',"mast/routes/__readme.md");
	generateFile('__readme_mast_templates.md',"mast/templates/__readme.md");
	generateFile('__readme_js.md',"public/js/__readme.md");
	generateFile('__readme_stylesheets.md',"public/stylesheets/__readme.md");
	generateFile('__readme_services.md',"services/__readme.md");

	// Generate a file
	function generateFile(blueprintPath,outputPath) {
		var file = fs.readFileSync(__dirname+'/blueprints/'+(blueprintPath || ""),'utf8');
		fs.writeFileSync(newAppPath+'/'+(outputPath || ""),file);
	}

	// Generate a directory
	function generateDir(outputPath) {
		fs.mkdirSync(newAppPath+"/"+(outputPath || ""));
	}
}

// Utility class to generate a file given the blueprint and output paths,
// as well as an optional ejs render override.
function generate (blueprintPath,outputPath,outputExtension) {
	if (!argv._[2]) {
		throw new Error ('No output file name specified!');
	}
	
	var entityName = capitalize(argv._[2]),
	file = fs.readFileSync(__dirname+blueprintPath,'utf8');
	file = ejs.render(file,{name: entityName});
	fs.writeFileSync(outputPath+"/"+entityName+outputExtension,file);
}


// Utility class to capitalize the first letter of a string
function capitalize(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

