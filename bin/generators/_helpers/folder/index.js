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
 * @option {String} gitkeep
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
		force: false
	});
	var missingOpts = _.difference([
		'pathToNew'
	], Object.keys(options));
	if ( missingOpts.length ) return handlers.invalid(missingOpts);


	var pathToNew = path.resolve( process.cwd() , options.pathToNew );

	var pathParts = pathToNew.split('/');
	var pathBuilt = '';

	async.whilst(
		function _while () {return pathParts.length;},
		function _do (cb) {
			var nextPart = pathParts.shift();
			pathBuilt += nextPart + '/';
			fs.lstat(pathBuilt, function (err, inodeStatus) {

				// If the dir already exists, skip it.  Could just check for this
				// in the mkdir call below, but something about attempting to 
				// create the root directory seems...unwise.
				var exists = !(err && err.code === 'ENOENT');
				if ( exists ) {
					return cb();
				}

				// Make the directory, ignoring "already exists" errors as other
				// generators may have created the directory at the same time as us.
				fs.mkdir(pathBuilt, function(err) {
					if (err) {return cb(err);} 
					else {return cb();}
				});

			});

		},
		function _eventually (err) {
			if (err && err.code === 'ENOENT') {return handlers.alreadyExists();} 
			else if (err && err.code === 'EEXIST') {return handlers.alreadyExists();} 
			else if (err) {return handlers.error(err);}

			if (options.gitkeep) {
				fs.outputFile(pathToNew + '/.gitkeep', '', handlers.success);
			} else {
				return handlers.success();
			}
		}
	);
};
