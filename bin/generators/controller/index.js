/**
 * Module dependencies
 */
var generateFile = require('../_helpers/file');
var Sails = require('../../../lib/app');
var path = require('path');
var _ = require('lodash');
_.str = require('underscore.string');



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
			filename: options.globalID + 'Controller.' + options.ext,
		});

		return options;
	},



	/**
	 * Render the string contents to write to disk for this module.
	 * e.g. read a template file
	 *
	 * @param {Object} options
	 * @param {Function} cb (err, stringToWrite)
	 */
	render: function (options, cb) {
		return cb(null, 'TODO');
	}
	
};


