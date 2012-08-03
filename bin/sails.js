#!/usr/bin/env node

var ejs = require('ejs'),
	fs = require('fs');

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
	
	// Create meta views
//	fs.mkdirSync(newAppPath+"/meta");
//	file = fs.readFileSync(__dirname+'/blueprints/view.ejs','utf8');
//	fs.writeFileSync(outputPath+"/meta/home.ejs",file);
//	fs.writeFileSync(outputPath+"/404.ejs",file);
//	fs.writeFileSync(outputPath+"/500.ejs",file);
//	fs.writeFileSync(outputPath+"/403.ejs",file);
		
	// Create meta controller
	
	
	// Create rigging for Mast
	fs.mkdirSync(newAppPath+"/mast");
	fs.mkdirSync(newAppPath+"/mast/components");
	fs.mkdirSync(newAppPath+"/mast/routes");
	fs.mkdirSync(newAppPath+"/mast/templates");
	fs.mkdirSync(newAppPath+"/mast/models");
	
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