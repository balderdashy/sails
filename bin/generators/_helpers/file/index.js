/**
 * Module dependencies
 */
var fs = require('fs-extra'),
	path = require('path'),
	ejs = require('ejs'),
	async = require('async'),
	_ = require('lodash');
var switcher = require('../../../../util/switcher');




/**
 * Generate a file using the specified string.
 *
 * @option {String} pathToNew
 * @option {String} contents - the string contents to write to disk
 * [@option {Boolean} force=false]
 * [@option {Boolean} dry=false]
 *
 * @handlers ok
 * @handlers error
 * @handlers invalid
 * @handlers alreadyExists
 */
module.exports = function ( options, handlers ) {

	// Provide default values for handlers
	handlers = switcher(handlers);

	// Provide defaults and validate required options
	_.defaults(options, {
		force: false
	});
	var missingOpts = _.difference([
		'contents',
		'pathToNew'
	], Object.keys(options));
	if ( missingOpts.length ) return handlers.invalid(missingOpts);

	var pathToNew = path.resolve( process.cwd() , options.pathToNew );	

	// Only override an existing file if `options.force` is true
	fs.exists(pathToNew, function (exists) {
		if (exists && !options.force) {
			return handlers.alreadyExists(pathToNew);
		}

		// Don't actually write the file if this is a dry run.
		if (options.dry) return handlers.ok();

		async.series([
			function deleteExistingFileIfNecessary (cb) {
				if ( !exists ) return cb();
				return fs.remove(pathToNew, cb);
			},
			function writeToDisk (cb) {
				fs.outputFile(pathToNew, options.contents, cb);
			}
		], function (err) {
			if (err) return handlers.error(err);
			else handlers.ok();
		});

	});

};
