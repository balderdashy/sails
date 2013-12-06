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
 * @option {String} pathToNewFile
 * @option {String} pathToTemplate
 * [@option {String} templateEncoding='utf-8']
 * [@option {Object} data={}]
 * [@option {Boolean} force=false]
 *
 * @handlers ok
 * @handlers error
 * @handlers invalid
 * @handlers alreadyExists
 */
module.exports = function ( options, handlers ) {
	

	// Provide defaults and validate required options
	_.defaults(options, {
		data: {},
		force: false,
		templateEncoding: 'utf8'
	});
	var missingOpts = options._require([
		'pathToTemplate',
		'pathToNewFile'
	]);
	if ( missingOpts.length ) return handlers.invalid(missingOpts);


	var absPathToNewFile = path.resolve( process.cwd() , options.pathToNewFile );	
	var absPathToTemplate = path.resolve( process.cwd() , options.pathToTemplate );

	// Only override an existing file if `options.force` is true
	// console.log('would create '+absPathToNewFile);
	fs.exists(absPathToNewFile, function (exists) {
		if (exists && !options.force) {
			return handlers.alreadyExists(absPathToNewFile);
		}

		fs.readFile(absPathToTemplate, options.templateEncoding, function gotTemplate (err, templateStr) {
			if (err) return handlers.error(err);

			var renderedTemplate = ejs.render(templateStr, options.data);
			fs.outputFile(absPathToNewFile, renderedTemplate, function wroteFile (err) {
				if (err) return handlers.error(err);
				else handlers.ok();
			});
		});
	});

};
