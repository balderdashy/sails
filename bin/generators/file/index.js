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
 * @option {String} pathToNew
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
		'pathToNew'
	]);
	if ( missingOpts.length ) return handlers.invalid(missingOpts);

	var pathToNew = path.resolve( process.cwd() , options.pathToNew );	
	var pathToTemplate = path.resolve( process.cwd() , options.pathToTemplate );

	// Only override an existing file if `options.force` is true
	// console.log('would create '+pathToNew);
	fs.exists(pathToNew, function (exists) {
		if (exists && !options.force) {
			return handlers.alreadyExists(pathToNew);
		}

		fs.readFile(pathToTemplate, options.templateEncoding, function gotTemplate (err, templateStr) {
			if (err) return handlers.error(err);

			var renderedTemplate = ejs.render(templateStr, options.data);
			fs.outputFile(pathToNew, renderedTemplate, function wroteFile (err) {
				if (err) return handlers.error(err);
				else handlers.ok();
			});
		});
	});

};
