/**
 * Module dependencies
 */
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');
var async = require('async');
var switcher = require('sails-util/switcher');




/**
 * Generate a folder
 *
 * @option {String} pathToNew
 * @option {Boolean} gitkeep
 * [@option {Boolean} force=false]
 *
 * @handlers [success]
 * @handlers alreadyExists
 * @handlers invalid
 * @handlers error
 */
module.exports = function ( options, handlers ) {

	// Provide default values for handlers
	handlers = switcher(handlers, handlers.error);

	// Provide defaults and validate required options
	_.defaults(options, {
		force: false,
		gitkeep: false
	});
	var missingOpts = _.difference([
		'pathToNew'
	], Object.keys(options));
	if ( missingOpts.length ) return handlers.invalid(missingOpts);


	var pathToNew = path.resolve( process.cwd() , options.pathToNew );


	// Only override an existing folder if `options.force` is true
	fs.lstat(pathToNew, function(err, inodeStatus) {
		var exists = !(err && err.code === 'ENOENT');
		if (exists && err) return handlers.error(err);

		if (exists && !options.force) {
			return handlers.alreadyExists(pathToNew);
		}
		if (exists) {
			fs.remove(pathToNew, function deletedOldINode(err) {
				if (err) return handlers.error(err);
				_afterwards_();
			});
		} else _afterwards_();

		function _afterwards_() {
			fs.mkdirs(pathToNew, function directoryWasWritten(err) {
				if (err) return handlers.error(err);
				return handlers.success();
			});
		}
	});


	
	// ??
	//////////////////////////////////////////////
	// var pathParts = pathToNew.split('/');
	// var pathBuilt = '';
	// async.whilst(
	// 	function _while () {return pathParts.length;},
	// 	function _do (cb) {
	// 		var nextPart = pathParts.shift();
	// 		pathBuilt += nextPart + '/';

	// 		fs.lstat(pathBuilt, function (err, inodeStatus) {
	// 			console.log('-->', pathToNew, '::?::', pathBuilt);

	// 			// If the dir already exists, exit w/ EEXIST error.
	// 			// Could just check for this in the mkdir call below, 
	// 			// but something about attempting to create the root
	// 			// directory seems...unwise.
	// 			var exists = !(err && err.code === 'ENOENT');
	// 			if (err && !exists) {return cb(err);}
	// 			else if ( !err || exists ) {
	// 				return cb({ simulated: true, code: 'EEXIST' });
	// 			}

	// 			// Make the directory, ignoring "already exists" errors as other
	// 			// generators may have created the directory at the same time as us.
	// 			fs.mkdir(pathBuilt, function(err) {
	// 				if (err) return cb(err);
	// 				else return cb();
	// 			});

	// 		});

	// 	},
	// 	function _eventually (err) {
	// 		if (err && err.code === 'EEXIST') {return handlers.alreadyExists(err.code);} 
	// 		else if (err) {return handlers.error(err);}

	// 		// Write a .gitkeep file if `options.gitkeep` is set
	// 		if (options.gitkeep) {
	// 			fs.outputFile(pathToNew + '/.gitkeep', '', handlers.success);
	// 		} else {
	// 			return handlers.success();
	// 		}
	// 	}
	// );
};
