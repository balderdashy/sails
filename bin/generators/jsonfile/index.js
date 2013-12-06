/**
 * Module dependencies
 */
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');




/**
 * Generate a JSON file
 *
 * @option {String} pathToNew
 * @option {Object} data
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
		'pathToNew',
		'data'
	]);
	if ( missingOpts.length ) return handlers.invalid(missingOpts);


	var pathToNew = path.resolve( process.cwd() , options.pathToNew );

	// Only override an existing file if `options.force` is true
	fs.exists(pathToNew, function (exists) {
		if (exists && !options.force) {
			return handlers.alreadyExists(pathToNew);
		}

		fs.writeJSON(pathToNew, options.data, function wroteFile (err) {
			if (err) return handlers.error(err);
			else handlers.ok();
		});
	});
};
