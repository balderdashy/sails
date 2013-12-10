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
			dirPath: sails.config.paths.models,
			globalID: _.str.capitalize(options.id),
			attributes: []
		});

		_.defaults(options, {
			filename: options.globalID + '.' + options.ext
		});

		// Validate optional attribute arguments
		var invalidAttributes = [];
		attributes = util.map(attributes, function (attribute, i) {
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


		// Determine template paths to pull data from
		options.pathToControllerTemplate = path.resolve(
			process.cwd(),
			options.pathToControllerTemplate || (__dirname+'/controller.ejs') );
		options.pathToActionTemplate = path.resolve(
			process.cwd(),
			options.pathToActionTemplate || (__dirname+'/action.ejs'));


		// Determine `pathToNew`, the destination for the new file
		options.pathToNew = options.dirPath + '/' + options.filename;

		// Send back options
		handlers.ok(options);
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





// Only override an existing file if `options.force` is true
			// console.log('would create '+pathToNew);
			// fs.exists(pathToNew, function (exists) {
			// 	if (exists && !options.force) {
			// 		return handlers.alreadyExists(pathToNew);
			// 	}
			// 	if ( exists ) {
			// 		fs.remove(pathToNew, function deletedOldINode (err) {
			// 			if (err) return handlers.error(err);
			// 			_afterwards_();
			// 		});
			// 	}
			// 	else _afterwards_();

			// 	function _afterwards_() {
			// 		fs.outputFile(pathToNew, renderedTemplate, function fileWasWritten (err) {
			// 			if (err) return handlers.error(err);
			// 			else handlers.ok();
			// 		});
			// 	}
			// });



	////////////////////////////////////////////////////////////


	// // Trim peculiar characters from module id
	// options.id = _.str.trim(options.id, '/');

	// if ( missingOpts.length ) return handlers.invalid(missingOpts);
	// _.defaults(options, {
	// 	force: false,
	// 	actions: [],
	// 	appPath: process.cwd(),
	// 	dirPath: options.appPath || process.cwd(),
	// 	ext: 'js',
	// 	globalID: _.str.capitalize(options.id)
	// });

	// // Finish building config
	// options.dirPath += '/api/controllers';
	// options.globalID += 'Controller';
	// options.filename = options.globalID + '.' + options.ext;


	// // Ensure this directory is a Sails app  (override with `force` option)
	// if ( !Sails.isSailsApp( options.appPath ) && !options.force ) {
	// 	return handlers.notSailsApp();
	// }


	// // Validate optional actions argument
	// var errors = [];

	// // Make sure there aren't duplicate actions
	// if ((_.uniq(options.actions)).length !== options.actions.length) {
	// 	return handlers.invalid('Duplicate actions not allowed!');
	// }

	// // Validate action names
	// options.actions = _.map(options.actions, function (action, i) {
		
	// 	// TODO: actually validate the names
	// 	var invalid = false;

	// 	// Handle errors
	// 	if (invalid) {
	// 		return errors.push(
	// 			'Invalid action notation:   "' + action + '"');
	// 	}
	// 	return action;
	// });

	// // Handle invalid action arguments (send back errors)
	// if (errors.length) {
	// 	return handlers.invalid.apply(handlers, errors);
	// }

	// // Dry run option
	// if ( options.dry ) {
	// 	return _afterwards_();
	// }

	// var pathToControllerTemplate = path.resolve(__dirname,'./controller.ejs');
	// var controllerTemplate = fs.readFileSync(pathToControllerTemplate, 'utf8');
	// var pathToActionTemplate = path.resolve(__dirname,'./action.ejs');
	// var actionTemplate = fs.readFileSync(pathToActionTemplate, 'utf8');

	// // Create the actions' code
	// var renderedActions = _.map(options.actions, function (action) {
	// 	return ejs.render(actionTemplate, { actionName: action });
	// });

	// // Create the controller code
	// var renderedCode = ejs.render(controllerTemplate, {
	// 	filename: options.filename,
	// 	controllerName: options.globalID,
	// 	actions: renderedActions
	// });

	// // If it doesn't already exist, create a controller file
	// var modulePath = options.dirPath + '/' + options.filename;
	// if ( fs.existsSync(modulePath) && !options.force) {
	// 	return handlers.error(options.globalID + ' already exists!');
	// }
	// fs.outputFileSync(modulePath, renderedCode);


	// return _afterwards_();


	// Finish up with a success message
	// function _afterwards_() {

	


		// 	case 'model':

		// 		dirPath += '/api/models';
		// 		filename = globalID + '.' + ext;

				


		// 		// Make sure there aren't duplicates
		// 		var attrNames = util.pluck(attributes, 'name');
		// 		if ((util.uniq(attrNames)).length !== attrNames.length) {
		// 			return CLIController.invalid('Duplicate attributes not allowed!');
		// 		}

		// 		// Dry run option
		// 		if ( options.dry ) {
		// 			break;
		// 		}

		// 		var pathToModelTemplate = path.resolve(__dirname,'./generators/model.ejs');
		// 		var modelTemplate = fs.readFileSync(pathToModelTemplate, 'utf8');
		// 		var pathToAttributeTemplate = path.resolve(__dirname,'./generators/attribute.ejs');
		// 		var attributeTemplate = fs.readFileSync(pathToAttributeTemplate, 'utf8');

		// 		// Create the attributes' code
		// 		var renderedAttributes = util.map(attributes, function (attr) {
		// 			return ejs.render(attributeTemplate, attr);
		// 		});

		// 		// Create the model code
		// 		var renderedModelCode = ejs.render(modelTemplate, {
		// 			filename: filename,
		// 			attributes: attributes
		// 		});

		// 		// If it doesn't already exist, create a file
		// 		var modelPath = dirPath + '/' + filename;
		// 		if ( fs.existsSync(modelPath) ) {
		// 			return CLIController.error(globalID + ' already exists!');
		// 		}
		// 		fs.outputFileSync(modelPath, renderedModelCode);