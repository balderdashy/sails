

// Entirely unused at the moment!


// /**
//  * Module dependencies.
//  */

// var _ = require('lodash'),
// 	async = require('async'),
// 	ejs = require('ejs'),
// 	fs = require('fs-extra');

// // TODO: move all logging out of util


// module.exports = new UtilityBelt();

// function UtilityBelt() {




// 	/**
// 	 * Generate a file
// 	 *
// 	 * @api private
// 	 */

// 	this.generateFile = function(boilerplatePath, newPath) {
// 		var fullBpPath = __dirname + '/boilerplates/' + (boilerplatePath || '');
// 		var file = fs.readFileSync(fullBpPath, 'utf8');
// 		var newFilePath = (newPath || '');
// 		this.verifyDoesntExist(newFilePath, 'A file/directory already exists at ' + newFilePath);

// 		// Touch output file to make sure the path to it exists
// 		if (fs.createFileSync(newFilePath)) {
// 			log.error('Could not create file, ' + newFilePath + '!');
// 			process.exit(1);
// 		}
// 		fs.writeFileSync(newFilePath, file);
// 	};



// 	/**
// 	 * Generate a directory
// 	 *
// 	 * @api private
// 	 */

// 	this.generateDir = function(newPath, gitkeep) {
// 		if (!newPath) {
// 			log.verbose('Creating directory in pwd...');
// 		} else {
// 			log.verbose('Creating directory directory in ' + newPath + '...');
// 		}
// 		var newDirPath = (newPath || '');
// 		this.verifyDoesntExist(newDirPath, 'A file/directory already exists at ' + newDirPath);
// 		fs.mkdirSync(newDirPath);
// 		// If directory will be empty, create a .gitkeep in it
// 		if (gitkeep) {
// 			generateFile('.gitkeep', newPath + '/.gitkeep');
// 		}
// 	};


// 	/**
// 	 * Verify that a file doesn't exist
// 	 *
// 	 * @api private
// 	 */

// 	this.verifyDoesntExist = function(path, msg) {
// 		if (this.fileExists(path)) {
// 			log.error(msg);
// 			process.exit(1);
// 		}
// 	};



// 	/** 
// 	 * Check if a file or directory exists
// 	 *
// 	 * @api private
// 	 */

// 	this.fileExists = function(path) {
// 		try {
// 			// Query the entry
// 			var stats = fs.lstatSync(path);

// 			// Is it a directory?
// 			if (stats.isDirectory() || stats.isFile()) {
// 				return true;
// 			}
// 		} catch (e) {
// 			// ...
// 		}

// 		return false;
// 	};



// 	/** 
// 	 * Read a boilerplate and render the template
// 	 *
// 	 * @api private
// 	 */

// 	this.renderBoilerplateTemplate = function(boilerplate, data) {
// 		var boilerplatePath = __dirname + '/boilerplates/templates/' + boilerplate;
// 		this.verifyExists(boilerplatePath, "Boilerplate (" + boilerplate + ") doesn't exist!");
// 		var file = fs.readFileSync(boilerplatePath, 'utf8');
// 		return ejs.render(file, data);
// 	};



// 	/** 
// 	 *
// 	 *
// 	 * @api private
// 	 */

// 	this.verifyExists = function(path, msg) {
// 		if (!this.fileExists(path)) {
// 			log.error(msg);
// 			process.exit(1);
// 		}
// 	};



// 	/** 
// 	 * Copy a boilerplate directory or file
// 	 *
// 	 * @api private
// 	 */

// 	this.copyBoilerplate = function(boilerplate, destination, cb) {
// 		var boilerplatePath = __dirname + '/boilerplates/' + boilerplate;
// 		fs.copy(boilerplatePath, destination, function(err) {
// 			return cb && cb(err);
// 		});
// 	};



// 	* 
// 	 * Copy global sails module into current project as a local dependency
// 	 *
// 	 * @api private
	 

// 	this.copySails = function(destination, cb) {
// 		try {
// 			fs.mkdirSync(destination);
// 		} catch (e) {
// 			return cb && cb(e);
// 		}

// 		// Progress notifications
// 		var stopShowingProgressNotifications,
// 			errorCopying,
// 			interval = 150;


// 		// Draw progress notification
// 		// Returns progress function
// 		log.verbose('Copying modules into ' + destination + '...');
// 		var canvas = turtle();

// 		async.until(

// 			function checkIfDone() {
// 				canvas.tick();
// 				return stopShowingProgressNotifications;
// 			},

// 			function setAlarm(cb) {
// 				setTimeout(cb, interval);
// 			},

// 			function done(err) {
// 				// If an error occurred, send it back
// 				err = err || errorCopying;
// 				return cb && cb(err);
// 			});

// 		async.each(['lib', 'package.json', 'node_modules'], function(fileOrDir, cb) {
// 			fs.copy(__dirname + '/../' + fileOrDir, destination + '/' + fileOrDir, cb);
// 		}, function doneCopying(err) {

// 			// Hold onto error if there is one
// 			errorCopying = err;

// 			// When finished copying, mark done
// 			// progress notifications will trigger the callback
// 			stopShowingProgressNotifications = true;
// 		});
// 	};



// 	/** 
// 	 * Copy a core Sails dependency to the top-level node_modules directory
// 	 * of the current application---- in a smart way
// 	 *
// 	 * @api private
// 	 */

// 	this.copySailsDependency = function(moduleName, pathToNewNodeModules, cb) {
// 		var self = this;
// 		var path = __dirname + '/../node_modules/' + moduleName;
// 		fs.copy(path, pathToNewNodeModules + '/' + moduleName, function(err) {
// 			if (err) return cb && cb(err);

// 			// Parse the module's package.json
// 			var packageJSONPath = path + '/package.json';
// 			var packageJSON;
// 			try {
// 				packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));
// 			} catch (e) {

// 				// Ignore missing package.json
// 				packageJSON = {
// 					dependencies: {}
// 				};
// 			}

// 			// Get actual dependencies in this module's node_modules directory
// 			var dependencies;
// 			try {
// 				dependencies = fs.readdirSync(path + '/node_modules');

// 				// Remove hidden files
// 				_.without(dependencies, function(val) {
// 					return val.match(/\..+/);
// 				});
// 			} catch (e) {
// 				// Assume empty dependencies
// 				dependencies = {};
// 			}

// 			// If there are any missing dependencies which are being pulled from Sails,
// 			// copy them from Sails' main node_modules directory
// 			var missingModules = _.difference(_.keys(packageJSON.dependencies || {}), _.values(dependencies));
// 			_.each(missingModules, function(missingModuleName) {
// 				log.verbose('Resolving ' + moduleName + '\'s missing dependency (' + missingModuleName + ') using the version in Sails.');
// 				self.copySailsDependency(missingModuleName, pathToNewNodeModules + '/' + moduleName + '/node_modules/');
// 			});

// 			return cb && cb(err);
// 		});
// 	};

// }





