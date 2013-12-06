/**
 * Module dependencies
 */
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');





/**
 * Generate a folder
 *
 * @option {String} pathToParentDir
 * @option {String} filename - the filename for the new directory
 *
 * @handlers ok
 * @handlers error
 */
module.exports = function ( options, handlers ) {
	options.pathToParentDir = options.pathToParentDir || '.';
	var absPath = path.resolve( process.cwd() , options.pathToParentDir );
	absPath = path.resolve( absPath , options.filename );
	
	fs.mkdir(absPath, function (err) {
		if (err) return handlers.error(err);
		else handlers.ok();
	});
};







/**
 * Generate a folder
 *
 * @option {String} pathToNew
 * @option {Object} data
 * [@option {Boolean} force=false]
 *
 * @handlers ok
 * @handlers error
 * @handlers alreadyExists
 */
// module.exports = function ( options, handlers ) {

// 	// Provide defaults and validate required options
// 	_.defaults(options, {
// 		force: false
// 	});
// 	var missingOpts = options._require([
// 		'pathToNewFile',
// 		'data'
// 	]);
// 	if ( missingOpts.length ) return handlers.invalid(missingOpts);


// 	var absPathToNewFile = path.resolve( process.cwd() , options.pathToNewFile );

// 	// Only override an existing file if `options.force` is true
// 	fs.exists(absPathToNewFile, function (exists) {
// 		if (exists && !options.force) {
// 			return handlers.alreadyExists(absPathToNewFile);
// 		}

// 		fs.writeJSON(absPathToNewFile, options.data, function wroteFile (err) {
// 			if (err) return handlers.error(err);
// 			else handlers.ok();
// 		});
// 	});
// };
