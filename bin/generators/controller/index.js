/**
 * Module dependencies
 */
var generateFile = require('../_helpers/file');
var Sails = require('../../../lib/app');
var path = require('path');
var _ = require('lodash');
_.str = require('underscore.string');

var switcher = require('../switcher');


/**
 * Generate a Sails controller
 *
 * @property {Array} requiredOptions
 * @property {Function} configure(options, sails)
 * @property {Function} render(options, cb)
 *
 * @option {Boolean} id - the name for the new controller
 * @option {Array} actions - names of the actions
 */
module.exports = {

	/**
	 * If a required option is not specified, the generator will refuse to
	 * proceed until the error is corrected.
	 */
	requiredOptions: ['id'],



	/**
	 * Customize & provide defaults for this generator's options.
	 *
	 * @param {Object} options
	 * @param {SailsApp} sails
	 *
	 * @return options
	 */
	configure: function (options, sails) {

		_.defaults(options, {
			dirPath: sails.config.paths.controllers,
			globalID: _.str.capitalize(options.id),
			force: false,
			actions: [],
			ext: 'js'
		});

		_.defaults(options, {
			filename: options.globalID + 'Controller.' + options.ext
		});

		return options;
	},



	/**
	 * Render the string contents to write to disk for this module.
	 * e.g. read a template file
	 *
	 * @param {Object} options
	 *		@option {String} templateEncoding [='utf-8']
	 *		@option {Object} data [={}]
	 *
	 * @param {Function|Object} callback
	 *			-> `fn(err, stringToWrite)` or `{ ok: ..., error: ..., etc. }`
	 *		@case {Function|Object} ok
	 */
	render: function ( options, callback ) {
		console.log('Render...');
		return cb(null, 'TODO');

		// var pathToTemplate = path.resolve( process.cwd() , options.pathToTemplate );

		// Read template
		// fs.readFile(pathToTemplate, options.templateEncoding, function gotTemplate (err, templateStr) {
		// 	if (err) return handlers.error(err);

		// 	var renderedTemplate = ejs.render(templateStr, options.data);

		// 	// Only override an existing file if `options.force` is true
		// 	// console.log('would create '+pathToNew);
		// 	fs.exists(pathToNew, function (exists) {
		// 		if (exists && !options.force) {
		// 			return handlers.alreadyExists(pathToNew);
		// 		}
		// 		if ( exists ) {
		// 			fs.remove(pathToNew, function deletedOldINode (err) {
		// 				if (err) return handlers.error(err);
		// 				_afterwards_();
		// 			});
		// 		}
		// 		else _afterwards_();

		// 		function _afterwards_() {
		// 			fs.outputFile(pathToNew, renderedTemplate, function fileWasWritten (err) {
		// 				if (err) return handlers.error(err);
		// 				else handlers.ok();
		// 			});
		// 		}
		// 	});
		// });
	}

};


