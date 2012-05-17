var compressor = require('node-minify');

// Validators for file extensions
function isJs(filename) { return filename.match(/.+\.js$/g); }
function isCss(filename) { return filename.match(/.+\.css$/g); }

// Grab a list of applicable filenames given a directory name
function ls(dirPath,filenameValidator) {
	var filenames = [];
	fs.readdirSync(dirPath).forEach(function(filename) {

		// TODO: Use conventions w/ filenames to improve everything
		// see https://github.com/balderdashdesign/mast/issues/5
	
		// Ignore files that start with an underscore
		if ((filename[0] === '_')) {
			return;
		}
	
		// Add this filename to the list
		if (filenameValidator && filenameValidator(filename)) {
			filenames.push(path.join(dirPath, filename));
		}
	});
	return filenames;
}

function decorateDependency(filename) {return "mast/lib/dependencies/"+filename+".min.js"}

// Determine all of the files that should be compiled
var jsDependencies =	_.map(["jquery","jquery-ui","underscore","backbone"],decorateDependency);
var jsMastCoreFiles =	ls("mast/lib",isJs);
var jsComponentFiles =	ls('mast/components',isJs);
var jsRouteFiles =		ls('mast/routes',isJs);
var cssTemplateFiles =	ls('mast/templates',isCss);

// TODO: Crawl components and determine dependencies



// Define the view partial

tui = "WTF";

if (config.appEnvironment=="production") {
	
	// Combine and minify css
	console.log("cssTemplateFiles",cssTemplateFiles);
	new compressor.minify({
		type: 'yui',
		fileIn: cssTemplateFiles,
		fileOut: './public/_target/app.css'
	});
	
	
	
	// Combine and minify js
	var logicFiles = _.union(jsMastCoreFiles,jsComponentFiles,jsRouteFiles);
	console.log("logicFiles",logicFiles);
	new compressor.minify({
		type: 'gcc',
		fileIn: logicFiles,
		fileOut: './public/_target/app.js'
	});
}

else if (config.appEnvironment=="development") {
	// Public access to /mast directory is only enabled in development mode
	// See express's app.configure() in main.js
	
	// We take advantage of that by directly linking to all of the necessary files
	
	// Create links css
	console.log("cssTemplateFiles",cssTemplateFiles);
	
	
	// Combine and minify js
	var logicFiles = _.union(jsMastCoreFiles,jsComponentFiles,jsRouteFiles);
	console.log("logicFiles",logicFiles);
	

}