/**
 * Module dependencies
 */
var generateFile = require('./_helpers/file');
var Sails = require('../../../lib/app');
var path = require('path');
var _ = require('lodash');
var ejs = require('ejs');
var fs = require('fs-extra');
_.str = require('underscore.string');


/**
 * Generate a Sails module
 *
 * @option {Boolean} id - the base identity for the new module
 * [@option {Boolean} force]
 * [@option {Boolean} dirPath]
 * [@option {Boolean} ext]
 * [@option {Boolean} actions]
 * [@option {Boolean} globalID]
 *
 * @handlers ok
 * @handlers notSailsApp
 * @handlers error
 */
module.exports = function ( options, handlers ) {
	
	// Provide defaults and validate required options
	var missingOpts = options._require([
		'id'
	]);

	// Trim peculiar characters from module id
	options.id = _.str.trim(options.id, '/');

	if ( missingOpts.length ) return handlers.invalid(missingOpts);
	_.defaults(options, {
		force: false,
		actions: [],
		appPath: process.cwd(),
		dirPath: options.appPath || process.cwd(),
		ext: 'js',
		globalID: _.str.capitalize(options.id)
	});

	// Finish building config
	options.dirPath += '/api/controllers';
	options.globalID += 'Controller';
	options.filename = options.globalID + '.' + options.ext;


	// Ensure this directory is a Sails app  (override with `force` option)
	if ( !Sails.isSailsApp( options.appPath ) && !options.force ) {
		return handlers.notSailsApp();
	}


	// Validate optional actions argument
	var errors = [];

	// Make sure there aren't duplicate actions
	if ((_.uniq(options.actions)).length !== options.actions.length) {
		return handlers.invalid('Duplicate actions not allowed!');
	}

	// Validate action names
	options.actions = _.map(options.actions, function (action, i) {
		
		// TODO: actually validate the names
		var invalid = false;

		// Handle errors
		if (invalid) {
			return errors.push(
				'Invalid action notation:   "' + action + '"');
		}
		return action;
	});

	// Handle invalid action arguments (send back errors)
	if (errors.length) {
		return handlers.invalid.apply(handlers, errors);
	}

	// Dry run option
	if ( options.dry ) {
		return _afterwards_();
	}

	var pathToControllerTemplate = path.resolve(__dirname,'./controller.ejs');
	var controllerTemplate = fs.readFileSync(pathToControllerTemplate, 'utf8');
	var pathToActionTemplate = path.resolve(__dirname,'./action.ejs');
	var actionTemplate = fs.readFileSync(pathToActionTemplate, 'utf8');

	// Create the actions' code
	var renderedActions = _.map(options.actions, function (action) {
		return ejs.render(actionTemplate, { actionName: action });
	});

	// Create the controller code
	var renderedCode = ejs.render(controllerTemplate, {
		filename: options.filename,
		controllerName: options.globalID,
		actions: renderedActions
	});

	// If it doesn't already exist, create a controller file
	var modulePath = options.dirPath + '/' + options.filename;
	if ( fs.existsSync(modulePath) && !options.force) {
		return handlers.error(options.globalID + ' already exists!');
	}
	fs.outputFileSync(modulePath, renderedCode);


	return _afterwards_();


	// Finish up with a success message
	function _afterwards_() {

		// Send back a return value (for use in logs)
		var returnStr = {
			debug: '',
			verbose: ''
		};

		// Change verbiage/style if this was a dry run
		if (options.dry) {
			returnStr.debug += 'DRY RUN:';
		}
		
		var actionTaken = options.dry ?
			'Would have generated' :
			'Generated';


		// If actions were specified:
		if (options.actions && options.actions.length) {
			returnStr.debug += actionTaken + ' a new controller called ' + options.globalID + ' with actions:';
			_.each(options.actions, function (action) {
				returnStr.debug += '  ',options.globalID + '.' + action + '()';
			});
		}

		// General case
		else returnStr.debug += actionTaken + ' ' + module + ' `' + options.globalID + '`!';

		// Finally,
		if (options.dry) {
			returnStr.verbose += 'New file would have been created: ' + options.dirPath + '/' + options.filename;
		}
		else returnStr.verbose += 'New file created: ' + options.dirPath + '/' + options.filename;

		return handlers.ok(returnStr);
	}
};
