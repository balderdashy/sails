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
		if (err && err.code !== 'ENOENT') {
			return handlers.error(err);
		}
		var exists = !!err;

		if (!options.force && exists) {
			return handlers.alreadyExists(pathToNew);
		}

		fs.mkdir(pathToNew, function wroteDir (err) {
			if (err) return handlers.error(err);
			else handlers.ok();
		});
	});
};
