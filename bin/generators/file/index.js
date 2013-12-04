/**
 * Module dependencies
 */
var fs = require('fs-extra');

/**
 * Generate a file using a template.
 *
 * @option {String} filename - the filename for the new file
 * @option {String} pathToTemplate
 * [@option {String} pathToParentDir='.']
 * [@option {String} templateEncoding='utf-8']
 * [@option {Object} data={}]
 *
 * @handlers ok
 * @handlers error
 */
module.exports = function ( options, handlers ) {
	options.pathToParentDir = options.pathToParentDir || '.';
	options.data = options.data || {};
	options.templateEncoding = options.templateEncoding || 'utf-8';

	var absPathToNewFile = path.resolve( process.cwd() , options.pathToParentDir );
	absPathToNewFile = path.resolve( absPathToNewFile , options.filename );
	
	var absPathToTemplate = path.resolve( process.cwd() , options.pathToTemplate );

	fs.readFile(absPathToTemplate, 'utf-8', function gotTemplate (err, templateStr) {
		if (err) return handlers.error(err);

		var renderedTemplate = ejs.render(templateStr, options.data);
		fs.writeFile(absPathToNewFile, renderedTemplate, function wroteFile (err){
			if (err) return handlers.error(err);
			else handlers.ok();
		});
	});


};
