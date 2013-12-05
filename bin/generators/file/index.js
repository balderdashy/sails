/**
 * Module dependencies
 */
var fs = require('fs-extra'),
	path = require('path'),
	ejs = require('ejs'),
	_ = require('lodash');

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
 * @handlers invalid
 */
module.exports = function ( options, handlers ) {
	

	// Provide defaults and validate required options
	_.defaults(options, {
		pathToParentDir: '.',
		data: {},
		templateEncoding: 'utf-8'
	});
	var missingOpts = options._require([
		'pathToTemplate',
		'filename'
	]);
	if ( missingOpts.length ) return handlers.invalid(missingOpts);




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

