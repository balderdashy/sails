/**
 * Module dependencies
 */
var generateFile = require('../file');
var Sails = require('../../../lib/app');
var _ = require('lodash');
_.str = require('underscore.string');



/**
 * Generate a Sails controller
 *
 * @option {Boolean} id - the name for the new controller
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
		return CLIController.invalid('Duplicate actions not allowed!');
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
	var renderedActions = _.map(actions, function (action) {
		return ejs.render(actionTemplate, { actionName: action });
	});

	// Create the controller code
	var renderedCode = ejs.render(controllerTemplate, {
		filename: options.filename,
		controllerName: globalID,
		actions: renderedActions
	});

	// If it doesn't already exist, create a controller file
	var modulePath = options.dirPath + '/' + options.filename;
	if ( fs.existsSync(modulePath) ) {
		return CLIController.error(globalID + ' already exists!');
	}
	fs.outputFileSync(modulePath, renderedCode);


	return _afterwards_();


	// Finish up with a success message
	function _afterwards_() {

		// Change verbiage/style if this was a dry run
		if (options.dry) {
			log.debug('DRY RUN:');
		}
		var logFn = options.dry ?
			log.debug :
			log.info;
		var actionTaken = options.dry ?
			'Would have generated' :
			'Generated';


		// If attributes were specified:
		if (attributes && attributes.length) {
			logFn( actionTaken + ' a new model called ' + globalID + ' with attributes:');
			_.each(attributes, function (attr) {
				logFn('  ',attr.name,'    (' + attr.type + ')');
			});
		}

		// If actions were specified:
		else if (actions && actions.length) {
			logFn(actionTaken + ' a new controller called ' + globalID + ' with actions:');
			_.each(actions, function (action) {
				logFn('  ',globalID + '.' + action + '()');
			});
		}

		// General case
		else logFn(actionTaken + ' ' + module + ' `' + globalID + '`!');

		// Finally,
		if (options.dry) {
			log.verbose('New file would have been created: ' + dirPath + '/' + filename);
		}
		else log.verbose('New file created: ' + dirPath + '/' + filename);

	}
};
