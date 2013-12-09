/**
 * Module dependencies
 */
var fs = require('fs-extra');
var _ = require('lodash');
var path = require('path');
var switcher = require('../../../../util/switcher');




/**
 * Generate a folder
 *
 * @option {String} pathToNew
 * [@option {Boolean} force=false]
 *
 * @handlers [ok]
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
				_afterwards_();
			});
		}
		else _afterwards_();

		function _afterwards_() {
			fs.mkdir(pathToNew, function directoryWasWritten (err) {
				if (err) return handlers.error(err);
				return handlers.ok();
			});
		}

	});
};
