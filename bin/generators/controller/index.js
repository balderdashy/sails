/**
 * Module dependencies
 */
var _ = require('lodash');

var path = require('path');
var ejs = require('ejs');
var fs = require('fs-extra');

var generateFile = require('../_helpers/file');
_.str = require('underscore.string');

// var switcher = require('../switcher');


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
			templateEncoding: 'utf8',
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
	 *
	 * @param {Function|Object} callback
	 *			-> `fn(err, stringToWrite)` or `{ ok: ..., error: ..., etc. }`
	 *		@case {Function|Object} ok
	 */
	render: function ( options, cb ) {

		var pathToTemplate = path.resolve(
			process.cwd() ,
			options.pathToTemplate || (__dirname+'/controller.ejs') );

		// Read controller template from disk
		fs.readFile(pathToTemplate, options.templateEncoding, function gotTemplate (err, templateStr) {
			if (err) return handlers.error(err);

			// Render data into template
			var renderedTemplate = ejs.render(templateStr, {
				filename: options.filename,
				actions: ''
			});
			cb(null, renderedTemplate);
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

	// 	// Send back a return value (for use in logs)
	// 	var returnStr = {
	// 		debug: '',
	// 		verbose: ''
	// 	};

	// 	// Change verbiage/style if this was a dry run
	// 	if (options.dry) {
	// 		returnStr.debug += 'DRY RUN:';
	// 	}
		
	// 	var actionTaken = options.dry ?
	// 		'Would have generated' :
	// 		'Generated';


	// 	// If actions were specified:
	// 	if (options.actions && options.actions.length) {
	// 		returnStr.debug += actionTaken + ' a new controller called ' + options.globalID + ' with actions:';
	// 		_.each(options.actions, function (action) {
	// 			returnStr.debug += '  ',options.globalID + '.' + action + '()';
	// 		});
	// 	}

	// 	// General case
	// 	else returnStr.debug += actionTaken + ' ' + module + ' `' + options.globalID + '`!';

	// 	// Finally,
	// 	if (options.dry) {
	// 		returnStr.verbose += 'New file would have been created: ' + options.dirPath + '/' + options.filename;
	// 	}
	// 	else returnStr.verbose += 'New file created: ' + options.dirPath + '/' + options.filename;

	// 	return handlers.ok(returnStr);
	// }