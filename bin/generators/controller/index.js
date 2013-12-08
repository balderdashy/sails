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
 */
module.exports = {

	requiredOptions: ['id'],

	/**
	 * @option {Boolean} id - the name for the new controller
	 * @option {Array} actions - names of the actions
	 * [@option {Boolean} globalID]
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
	}
};


