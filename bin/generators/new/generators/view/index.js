/**
 * Module dependencies
 */
var _ = require('lodash');
_.str = require('underscore.string');

var path = require('path');
var ejs = require('ejs');
var fs = require('fs-extra');



/**
 * Generate a Sails view.
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
	 * Provide custom validations & defaults for this generator's options.
	 *
	 * @param {Object} options
	 * @param {SailsApp} sails
	 * @param {Object{Functions}} handlers
	 *
	 * @return options
	 */
	configure: function (options, sails, handlers) {

		_.defaults(options, {
			dirPath: sails.config.paths.views,
			ext: options.viewEngine
		});
		_.defaults(options, {
			filename: options.id + '.' + options.ext
		});

		// Determine template by looking at the `id`
		options.templatefilePath = path.resolve(
			__dirname, 'ejs/home/index.ejs'
		);

		// Determine `pathToNew`, the destination for the new file
		options.pathToNew = options.dirPath + '/' + options.filename;

		return handlers.success(options);
	},



	// render: function ( options, cb ) {

	// 	fs.readFile(options.template, options.templateEncoding, function gotTemplate (err, template) {
	// 		if (err) return cb(err);
	// 		options.contents = ejs.render(template, options);
	// 		cb(null, options);
	// 	});
	// }

};

