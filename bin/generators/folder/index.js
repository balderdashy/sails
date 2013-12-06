/**
 * Module dependencies
 */
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');





/**
 * Generate a folder
 *
 * @option {String} pathToNew
 * [@option {Boolean} force=false]
 *
 * @handlers ok
 * @handlers error
 * @handlers alreadyExists
 */
module.exports = function ( options, handlers ) {

	// Provide defaults and validate required options
	_.defaults(options, {
		force: false
	});
	var missingOpts = options._require([
		'pathToNew'
	]);
	if ( missingOpts.length ) return handlers.invalid(missingOpts);


	var pathToNew = path.resolve( process.cwd() , options.pathToNew );

	// Only override an existing folder if `options.force` is true
	fs.lstat(pathToNew, function (err, inodeStatus) {
		var exists = !(err && err.code === 'ENOENT');
		if ( exists && err ) return handlers.error(err);

		if ( exists && !options.force ) {
			return handlers.alreadyExists(pathToNew);
		}
		if ( exists ) {
			fs.remove(pathToNew, function deletedOldINode (err) {
				if (err) return handlers.error(err);
				fs.mkdir(pathToNew, _newDirWritten_);
			});
		}
		else fs.mkdir(pathToNew, _newDirWritten_);

		function _newDirWritten_ (err) {
			if (err) return handlers.error(err);
			else handlers.ok();
		}

	});
};
