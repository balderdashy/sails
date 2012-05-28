var compressor = require('node-minify');

// Validators for file extensions
function isJs(filename) { return filename.match(/.+\.js$/g); }
function isCss(filename) { return filename.match(/.+\.css$/g); }

// Grab a list of applicable filenames given a directory name
function ls(dirPath,filenameValidator,newPathPrefix) {
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
			filenames.push(path.join(newPathPrefix || dirPath, filename));
		}
	});
	return filenames;
}

var isProduction = config.appEnvironment=="production",
	isDevelopment = config.appEnvironment=="development";
	
function decorateDependency(filename) {
	if (isDevelopment) {
		return "/_lib/dependencies/"+filename+".min.js"
	}
	else {
		return "lib/mast/_lib/dependencies/"+filename+".min.js"
	}
}

function decorateCoreFile(filename) {
	if (isDevelopment) {
		return "/_lib/"+filename;
	}
	else {
		return "lib/mast/_lib/"+filename;
	}
}

// TODO: Crawl components and determine dependencies

// Determine all of the files that should be compiled
var jsDependencies =	_.map(["jquery","jquery-ui","underscore","backbone"],decorateDependency);
var jsMastCoreFiles =  _.map(["logger.js","outside.js","mast.js"],decorateCoreFile);
var jsModelFiles =		ls('mast/models',isJs,(isDevelopment)?"/models":null);
var jsComponentFiles =	ls('mast/components',isJs,(isDevelopment)?"/components":null);
var jsRouteFiles =		ls('mast/routes',isJs,(isDevelopment)?"/routes":null);
var cssTemplateFiles =	ls('mast/templates',isCss,(isDevelopment)?"/templates":null);

// Define the global array of js filenames
// TODO: replace this w/ a dynamically generated view partial file in /public/_target
// to avoid cluttering the namespace
_mastJsFiles = _.union(jsDependencies,jsMastCoreFiles,jsModelFiles,jsComponentFiles,jsRouteFiles);
_mastCssFiles = cssTemplateFiles;
console.log("_mastJsFiles",_mastJsFiles);
console.log("_mastCssFiles",_mastCssFiles);

if (isProduction) {
	
	// Combine and minify css
	new compressor.minify({
		type: 'yui',
		fileIn: _mastCssFiles,
		fileOut: './public/_target/app.css'
	});
	
	
	
	// Combine and minify js
	new compressor.minify({
		type: 'gcc',
		fileIn: _mastJsFiles,
		fileOut: './public/_target/app.js'
	});
}

else if (isDevelopment) {
	// Public access to /mast directory is only enabled in development mode
	// See express's app.configure() in main.js
	
	// We take advantage of that by directly linking to all of the necessary files

}