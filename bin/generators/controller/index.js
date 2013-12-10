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
			dirPath: sails.config.paths.controllers,
			globalID: _.str.capitalize(options.id) + 'Controller',
			actions: []
		});


		_.defaults(options, {
			filename: options.globalID + '.' + options.ext
		});

		// Validate optional action arguments
		var actions = options.actions;
		var invalidActions = [];
		actions = _.map(actions, function (action, i) {
			
			// TODO: validate action names
			var invalid = false;

			// Handle errors
			if (invalid) {
				return invalidActions.push(
					'Invalid action notation:   "' + action + '"');
			}
			return action;
		});

		// Handle invalid action arguments
		// Send back invalidActions
		if (invalidActions.length) {
			return handlers.invalid(invalidActions);
		}

		// Make sure there aren't duplicates
		if ((_.uniq(actions)).length !== actions.length) {
			return handlers.invalid('Duplicate actions not allowed!');
		}



		// Determine template paths to pull data from
		options.pathToControllerTemplate = path.resolve(
			process.cwd(),
			options.pathToControllerTemplate || (__dirname+'/controller.ejs') );
		options.pathToActionTemplate = path.resolve(
			process.cwd(),
			options.pathToActionTemplate || (__dirname+'/action.ejs'));


		// Determine `pathToNew`, the destination for the new file
		options.pathToNew = options.dirPath + '/' + options.filename;

		return handlers.ok(options);
	},



	/**
	 * Render the string contents to write to disk for this module.
	 * e.g. read a template file
	 *
	 * @param {Object} options
	 *		@option {String} id
	 *		@option {String} pathToControllerTemplate
	 *		@option {String} pathToActionTemplate
	 *		@option {String} templateEncoding [='utf-8']
	 *
	 * @param {Function|Object} callback
	 *			-> `fn(err, stringToWrite)` or `{ ok: ..., error: ..., etc. }`
	 *		@case {Function|Object} ok
	 */
	render: function ( options, cb ) {

		// Read controller template from disk
		fs.readFile(options.pathToControllerTemplate, options.templateEncoding, function gotTemplate (err, controllerTemplate) {
			if (err) return handlers.error(err);

			fs.readFile(options.pathToActionTemplate, options.templateEncoding, function gotTemplate (err, actionTemplate) {
				if (err) return handlers.error(err);

				// Create the actions' code
				var renderedActions = _.map(options.actions, function (action) {
					return ejs.render(actionTemplate, { actionName: action });
				});

				// Create the controller code
				var renderedController = ejs.render(controllerTemplate, {
					filename: options.filename,
					controllerName: options.globalID,
					actions: renderedActions
				});

				cb(null, renderedController);
			});
		});
	}

};

