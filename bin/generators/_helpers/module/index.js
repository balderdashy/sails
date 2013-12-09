/**
 * Module dependencies
 */
var path = require('path');
var ejs = require('ejs');
var fs = require('fs-extra');

var Sails = require('../../../../lib/app');
var _ = require('lodash');
_.str = require('underscore.string');
var async = require('async');
var switcher = require('../../../../util/switcher');

var GenerateFileHelper = require('../file');


/**
 * Generate a Sails module
 *
 * @option {Object} generator
 *
 * @handlers ok
 * @handlers notSailsApp
 * @handlers invalid
 * @handlers error
 */
module.exports = function ( options, handlers ) {
	handlers = switcher(handlers);
	
	// Validate required options
	var missingOpts = _.difference([
		'generator'
	], Object.keys(options));
	if ( missingOpts.length ) return handlers.invalid(missingOpts);

	// Save reference to generator so it won't be inadvertently overridden in `options`
	var generator = options.generator;

	var sails = new Sails();
	sails.load({
		appPath: options.appPath || process.cwd(),
		loadHooks: ['userconfig', 'moduleloader']
	}, function loadedSailsConfig (err) {
		if (err) {
			// TODO: negotiate error type
			return handlers.error(err);
		}

		// Run `configure` method of configured `generator` if it exists
		// This marshals and provides defaults for our options.
		if (generator.configure) {
			options = generator.configure(options, sails);
		}

		// Ensure required options specified by the configured `generator` actually exist
		if (generator.requiredOpts) {
			var missingOpts = _.difference(generator.requiredOpts, Object.keys(options)).length;
			if ( missingOpts.length ){
				return handlers.invalid('Missing required options for this generator ::', missingOpts);
			}
		}

		// Use contents override if specified
		options.contents = options.contents || '';
		async.series([

			// Call out to our `generator` to render our module.
			// It will respond with a string that we can write to disk.
			function renderContents (cb) {
				if ( !generator.render ) return cb();
				else generator.render(options, function (err, _contents) {
					if (err) return cb(err);
					options.contents = options.contents || _contents || '';
					return cb();
				});
			}

		], function (err) {
			if (err) return handlers.error(err);

			// Now write the contents to disk
			GenerateFileHelper(options, {
				ok: handlers.ok,
				error: handlers.error,
				alreadyExists: handlers.alreadyExists
			});
		});

	});
	
	return;
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
