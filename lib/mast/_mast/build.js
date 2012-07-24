var compressor = require('node-minify'),
fs = require('fs'),
async = require('async'),
_ = require('underscore'),
path = require('path');


exports.compile=function(compilerCallback){

	// Validators for file extensions
	function isJs(filename) {
		return filename.match(/.+\.js$/g);
	}
	function isCss(filename) {
		return filename.match(/.+\.css$/g);
	}

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
	
	function decorateDependency(filename) {
		return "dependencies/"+filename+".min.js"
		
	}

	function decorateCoreFile(filename) {
		return ""+filename;
	}

	// TODO: Crawl components and determine dependencies

	// Determine all of the files that should be compiled
	var jsDependencies =	_.map(["jquery","jquery-ui","underscore","backbone","logger","outside","pressFoo"],decorateDependency);
	var jsMastCore =		_.map(["mast.js"],decorateCoreFile);
	var jsMastModules =		_.map(["socket.js","pattern.js","component.js","table.js","extend.js"],decorateCoreFile);
	

	// Define the global array of js filenames
	_mastJsFiles = _.union(jsDependencies,jsMastCore,jsMastModules);	
	
	console.log("Compiling client-side assets...",_mastJsFiles);
	var compileWaitTimer = setInterval(function(){
		console.log("Still compiling client-side assets...")
	},2500);
	
	
	
	var a = new Date(),
	outFilename = "./mast-" + (a.getFullYear()+"").substr(-2)+"."+( a.getMonth() + 1)+"."+a.getDate() +".js";

	async.parallel([
		
		function (finishedJs) {
			// Combine and minify js
			new compressor.minify({
				type: 'gcc',
				fileIn: _mastJsFiles,
				fileOut: outFilename,
				callback: finishedJs
			})	
		}
		],function() {
			clearTimeout(compileWaitTimer);
			compilerCallback && compilerCallback();
		})

}

// Execute
exports.compile();