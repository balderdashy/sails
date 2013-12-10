/**
 * Module dependencies
 */
var _ = require('lodash');

var path = require('path');
var ejs = require('ejs');
var fs = require('fs-extra');

var generateFile = require('../_helpers/file');
_.str = require('underscore.string');


/**
 * Generate a Sails model
 *
 * @property {Array} requiredOptions
 * @property {Function} configure(options, sails)
 * @property {Function} render(options, cb)
 *
 * @option {Boolean} id - the name for the new model
 * @option {Array} attributes - names:types of the attributes
 */
module.exports = {

	/**
	 * If a required option is not specified, the generator will refuse to
	 * proceed until the error is corrected.
	 */
	requiredOptions: ['id'],



	/**
	 * Provide custom validations & defaults for this generator's options.
	 */
	configure: function (options, sails, handlers) {

		_.defaults(options, {
			dirPath: sails.config.paths.models,
			globalID: _.str.capitalize(options.id),
			attributes: []
		});

		_.defaults(options, {
			filename: options.globalID + '.' + options.ext
		});

		// Validate optional attribute arguments
		var invalidAttributes = [];
		options.attributes = _.map(options.attributes, function (attribute, i) {
			var parts = attribute.split(':');

			if ( parts[1] === undefined ) parts[1] = 'string';

			// Handle invalidAttributes
			if (!parts[1] || !parts[0]) {
				invalidAttributes.push(
					'Invalid attribute notation:   "' + attribute + '"');
				return;
			}
			return {
				name: parts[0],
				type: parts[1]
			};
		});

		// Handle invalid attribute arguments
		// Send back invalidAttributes
		if (invalidAttributes.length) {
			return handlers.invalid(invalidAttributes);
		}


		// Make sure there aren't duplicates
		var attrNames = _.pluck(options.attributes, 'name');
		if ((_.uniq(attrNames)).length !== attrNames.length) {
			return handlers.invalid('Duplicate attributes not allowed!');
		}


		// Determine template paths to pull data from
		options.templates = {};
		options.templates = {
			model: path.resolve(
				process.cwd(),
				options.templates.model || (__dirname+'/model.ejs') ),
			attribute: path.resolve(process.cwd(),
				options.templates.attribute || (__dirname+'/attribute.ejs'))
		};


		// Determine `pathToNew`, the destination for the new file
		options.pathToNew = options.dirPath + '/' + options.filename;

		// Send back options
		handlers.ok(options);
	},



	/**
	 * Render the string contents to write to disk for this module.
	 */
	render: function ( options, cb ) {

		// Read controller template from disk
		fs.readFile(options.templates.model, options.templateEncoding, function gotTemplate (err, modelTemplate) {
			if (err) return handlers.error(err);

			fs.readFile(options.templates.attribute, options.templateEncoding, function gotTemplate (err, attrTemplate) {
				if (err) return handlers.error(err);

				// Render the attributes' code
				var renderedAttrs = _.map(options.attributes, function (attr) {
					console.log('rending attr::',attr);
					return ejs.render(attrTemplate, attr);
				});

				// Render the code for the module as a string
				var renderedModule = ejs.render(modelTemplate, {
					filename: options.filename,
					attributes: renderedAttrs
				});

				cb(null, renderedModule);
			});
		});
	}

};


