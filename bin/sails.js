#!/usr/bin/env node

var ejs = require('ejs'),
	fs = require('fs');

var argv = 
	require('optimist').
	usage('Usage: $0 generate FILETYPE [string] FILENAME [string]').
	demand(3).
	argv;

// Locate app root
var appRoot = 
	outputPath = 
	'.';


// Generate a file
if (argv._[0] == 'generate') {
	if (argv._[1] == 'model') { generate('/blueprints/model.js',outputPath,".js"); }
	else if (argv._[1] == 'controller') { generate('/blueprints/controller.js',outputPath,".js"); }
	else if (argv._[1] == 'layout') { generate('/blueprints/layout.ejs',outputPath,".ejs"); }
	else if (argv._[1] == 'view') { generate('/blueprints/view.ejs',outputPath,".ejs"); }
	else if (argv._[1] == 'service') { generate('/blueprints/service.js',outputPath,".js"); }
}


// Utility class to generate a file given the blueprint and output paths
// assumes the entity is being passed as the correct cmdline argument
function generate (blueprintPath,outputPath,outputExtension) {
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