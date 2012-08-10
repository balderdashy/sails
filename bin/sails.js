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
var appRoot = 
	outputPath = 
	'.';

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
else {
	// If not an action, first argument == app name
	var newAppPath = outputPath+"/"+argv._[0];
	
	// Create core sails structure
	fs.mkdirSync(newAppPath);
	fs.mkdirSync(newAppPath+"/models");
	fs.mkdirSync(newAppPath+"/controllers");
	fs.mkdirSync(newAppPath+"/views");
	fs.mkdirSync(newAppPath+"/services");

	// Create driver file
	file = fs.readFileSync(__dirname+'/blueprints/sails.js','utf8');
	fs.writeFileSync(newAppPath+"/sails.js",file);
	
	// Create layout file
	file = fs.readFileSync(__dirname+'/blueprints/layout.ejs','utf8');
	fs.writeFileSync(newAppPath+"/views/layout.ejs",file);
	
	// Create meta controller
	file = fs.readFileSync(__dirname+'/blueprints/MetaController.js','utf8');
	fs.writeFileSync(newAppPath+"/controllers/MetaController.js",file);
	
	// Create meta views
	fs.mkdirSync(newAppPath+"/views/meta");
	file = fs.readFileSync(__dirname+'/blueprints/home.ejs','utf8');
	fs.writeFileSync(newAppPath+"/views/meta/home.ejs",file);
	file = fs.readFileSync(__dirname+'/blueprints/403.ejs','utf8');
	fs.writeFileSync(newAppPath+"/views/403.ejs",file);
	file = fs.readFileSync(__dirname+'/blueprints/403.json','utf8');
	fs.writeFileSync(newAppPath+"/views/403.json",file);
	file = fs.readFileSync(__dirname+'/blueprints/404.ejs','utf8');
	fs.writeFileSync(newAppPath+"/views/404.ejs",file);
	file = fs.readFileSync(__dirname+'/blueprints/404.json','utf8');
	fs.writeFileSync(newAppPath+"/views/404.json",file);
	file = fs.readFileSync(__dirname+'/blueprints/500.ejs','utf8');
	fs.writeFileSync(newAppPath+"/views/500.ejs",file);
	file = fs.readFileSync(__dirname+'/blueprints/500.json','utf8');
	fs.writeFileSync(newAppPath+"/views/500.json",file);
	
	// Create static assets
	fs.mkdirSync(newAppPath+"/public");
	fs.mkdirSync(newAppPath+"/public/images");
	fs.mkdirSync(newAppPath+"/public/stylesheets");
	fs.mkdirSync(newAppPath+"/public/js");
	generateSimple(__dirname+'/blueprints/reset.css',newAppPath+"/public/stylesheets/reset.css");
	generateSimple(__dirname+'/blueprints/layout.css',newAppPath+"/public/stylesheets/layout.css");
	fs.copy(__dirname+'/blueprints/bg.png',newAppPath+"/public/images/bg.png");
	
	// Create rigging for Mast
	fs.mkdirSync(newAppPath+"/mast");
	fs.mkdirSync(newAppPath+"/mast/components");
	fs.mkdirSync(newAppPath+"/mast/routes");
	fs.mkdirSync(newAppPath+"/mast/templates");
	fs.mkdirSync(newAppPath+"/mast/models");
	
	// Create readme files
	generateSimple(__dirname+'/blueprints/__readme_models.md',newAppPath+"/models/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_controllers.md',newAppPath+"/controllers/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_views.md',newAppPath+"/views/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_mast.md',newAppPath+"/mast/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_mast_components.md',newAppPath+"/mast/components/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_mast_models.md',newAppPath+"/mast/models/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_mast_routes.md',newAppPath+"/mast/routes/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_mast_templates.md',newAppPath+"/mast/templates/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_js.md',newAppPath+"/public/js/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_stylesheets.md',newAppPath+"/public/stylesheets/__readme.md");
	generateSimple(__dirname+'/blueprints/__readme_services.md',newAppPath+"/services/__readme.md");
}


function generateSimple(blueprintPath,outputPath) {
	var file = fs.readFileSync(blueprintPath,'utf8');
	fs.writeFileSync(outputPath,file);
}



// Utility class to generate a file given the blueprint and output paths,
// as well as an optional ejs render override.
function generate (blueprintPath,outputPath,outputExtension) {
	if (!argv._[2]) {
		throw new Error ('No output file name specified!');
		return;
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

