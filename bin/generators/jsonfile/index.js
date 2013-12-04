/**
 * Module dependencies
 */
var fs = require('fs-extra');

/**
 * Generate a JSON file
 *
 * @option {Object} data
 * @option {String} pathToParentDir
 * @option {String} filename - the filename for the new JSON file
 *
 * @handlers ok
 * @handlers error
 */
module.exports = function ( options, handlers ) {
	options.pathToParentDir = options.pathToParentDir || '.';
	var absPath = path.resolve( process.cwd() , options.pathToParentDir );
	absPath = path.resolve( absPath , options.filename );
	
	fs.writeJSON(absPath, options.data, function (err){
		if (err) return handlers.error(err);
		else handlers.ok();
	});
};
