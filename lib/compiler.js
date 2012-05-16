var compressor = require('node-minify');


// Get all asset files in components dir
console.log("*************** COMPILING COMPONENTS! *************");
var cssFiles = [], jsComponentFiles = [];
fs.readdirSync('components').forEach(function(filename) {

	// TODO: Evaluate filename parsing convention, see https://github.com/balderdashdesign/mast/issues/5
			
	if ((filename === 'index.js') || (filename[0] === '_')) {
		return;
	}
	
	var filepath = path.join('components', filename);
	
	// Build list of js component files
	if (filename.match(/.+\.js$/g)) {
		jsComponentFiles.push(filepath);
	}
	else if (filename.match(/.+\.css$/g)) {
		cssFiles.push(filepath);
	}
});


// Get list of CSS files in the public/stylesheets dir
var cssLayoutFiles = [];
fs.readdirSync('public/stylesheets').forEach(function(filename) {

	if ((filename[0] === '_')) {
		return;
	}
	
	var filepath = path.join('public/stylesheets', filename);
	
	// Build list of main css files
	if (filename.match(/.+\.css$/g)) {
		cssLayoutFiles.push(filepath);
	}
});


// Enumerate files to be combined to form minifed Mast library
// Combine lists and compile
var jsMastFiles = ["./lib/client/logger.js",
"./lib/client/outside.js",
"./lib/client/mast.js"];
			
// Controller logic
var jsControllerFiles = ["./public/js/controller.js"];



if (config.appEnvironment=="production") {
	
	// Compress and compile CSS
	new compressor.minify({
		type: 'yui',
		fileIn: _.union(cssLayoutFiles,cssFiles),
		fileOut: './public/production/_app.css'
	});
	
	// Create combined js
	new compressor.minify({
		type: 'gcc',
		fileIn: _.union(jsMastFiles,jsComponentFiles,jsControllerFiles),
		fileOut: './public/production/_app.js'
	});
}






else if (config.appEnvironment=="development") {
	// Compile CSS
	new compressor.minify({
		type: 'yui',
		fileIn: cssFiles,
		fileOut: './public/stylesheets/_components.css'
	});

	// Compile JS components
	new compressor.minify({
		type: 'gcc',
		fileIn: jsComponentFiles,
		fileOut: './public/js/_components.js'
	});

	// Compile Mast
	new compressor.minify({
		type: 'gcc',
		fileIn: jsMastFiles,
		fileOut: './public/js/_mast.js'
	});

	// Compile controllers
	new compressor.minify({
		type: 'gcc',
		fileIn: jsControllerFiles,
		fileOut: './public/js/_controllers.js'
	});
}