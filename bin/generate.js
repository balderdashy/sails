/**
 * Module dependencies
 */
var util		= require('../util'),
	argv		= require('optimist').argv,
	Logger		= require('../lib/hooks/logger/captains');


// Build logger using command-line config
var log = new Logger(util.getCLIConfig(argv).log);




/**
 * `sails generate`
 *
 * Generate module(s) for the app in our working directory.
 */

module.exports = function generate ( options, handlers ) {

	// TODO: Load up Sails in the working directory in case
	// custom paths have been configured
	var path,
		errors,
		filename,
		attributes,
		actions,
		ext					= options.ext || 'js',
		appPath				= options.appPath || process.cwd(),
		module				= options.module,
		id					= options.id,
		globalID			= options.globalID || util.str.capitalize(options.id);
	

	switch ( module ) {

		case 'controller':

			path = options.path || appPath + '/api/controllers';
			actions = options.actions;
			globalID += 'Controller';
			filename = globalID + '.' + ext;

			// Validate optional action arguments
			errors = [];
			actions = util.map(actions, function (action, i) {
				
				// TODO: validate action names
				var invalid = false;

				// Handle errors
				if (invalid) {
					return errors.push(
						'Invalid action notation:   "' + action + '"');
				}
				return action;
			});

			// Handle invalid action arguments
			// Send back errors
			if (errors.length) {
				return handlers.invalid.apply(handlers, errors);
			}

			// Make sure there aren't duplicates
			if ((util.uniq(actions)).length !== actions.length) {
				return handlers.invalid('Duplicate actions not allowed!');
			}

			// Dry run option
			if ( options.dry ) {
				break;
			}

			// TODO: generate controller
			break;



		case 'model':

			path = options.path || appPath + '/api/models';
			attributes = options.attributes;
			filename = globalID + '.' + ext;

			// Validate optional attribute arguments
			errors = [];
			attributes = util.map(attributes, function (attribute, i) {
				var parts = attribute.split(':');

				if ( parts[1] === undefined ) parts[1] = 'string';

				// Handle errors
				if (!parts[1] || !parts[0]) {
					errors.push(
						'Invalid attribute notation:   "' + attribute + '"');
					return;
				}
				return {
					name: parts[0],
					type: parts[1]
				};
			});



			// Handle invalid attribute arguments
			// Send back errors
			if (errors.length) {
				return handlers.invalid.apply(handlers, errors);
			}


			// Make sure there aren't duplicates
			var attrNames = util.pluck(attributes, 'name');
			if ((util.uniq(attrNames)).length !== attrNames.length) {
				return handlers.invalid('Duplicate attributes not allowed!');
			}

			// Dry run option
			if ( options.dry ) {
				break;
			}

			// TODO: generate model
			// generate.generateModel(module, modelOpts);
			break;
	}



	// Finish up with a success message

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
		util.each(attributes, function (attr) {
			logFn('  ',attr.name,'    (' + attr.type + ')');
		});
	}

	// If actions were specified:
	else if (actions && actions.length) {
		logFn(actionTaken + ' a new controller called ' + globalID + ' with actions:');
		util.each(actions, function (action) {
			logFn('  ',globalID + '.' + action + '()');
		});
	}

	// General case
	else logFn(actionTaken + ' ' + module + ' `' + globalID + '`!');

	// Finally,
	if (options.dry) {
		log.verbose('New file would have been created: ' + path + '/' + filename);
	}
	else log.verbose('New file created: ' + path + '/' + filename);

	return;
};



// module.exports = function (sails) {


// 	/**
// 	 * Module dependencies.
// 	 */

// 	var _			= require( 'lodash' ),
// 		utils		= require( './utils' )(sails),
// 		fs			= utils.fs,
// 		pluralize	= require('pluralize');


// 	/**
// 	 * Expose new instance of `Generator`
// 	 */

// 	return new Generator();


// 	function Generator ( ) {


// 		/**
// 		 * Generate a Sails controller file
// 		 *
// 		 * @api private
// 		 */

// 		this.generateController = function (entity, options) {
// 			var newControllerPath = sails.config.paths.controllers + '/' + utils.capitalize(entity) + 'Controller.js';
// 			var newFederatedControllerPath = sails.config.paths.controllers + '/' + entity;

// 			utils.verifyDoesntExist(newControllerPath, 'A controller already exists at: ' + newControllerPath);
// 			utils.verifyDoesntExist(newFederatedControllerPath, 'A controller already exists at: ' + newFederatedControllerPath);

// 			// Federated controller
// 			if (options && (options.f || options.federated)) {

// 				utils.generateDir('./' + newFederatedControllerPath);
// 				util.each(options.actions, function(action) {

// 					action = utils.verifyValidEntity(action, 'Invalid action name: ' + action);

// 					return generate({
// 						boilerplate: 'federatedAction.ejs',
// 						prefix: sails.config.paths.controllers + '/' + entity,
// 						entity: entity,
// 						identity: entity.toLowerCase(),
// 						pluralIdentity: pluralize(entity),
// 						action: action,
// 						viewEngine: sails.config.views.engine,
// 						viewPath: require('underscore.string').rtrim(sails.config.paths.views, '/'),
// 						baseurl: '/' + entity,
// 						suffix: '.js'
// 					});
// 				});
// 			}
// 			// Monolithic controller
// 			else {
// 				var actions = '';

// 				// Add each requested function
// 				if (options && options.actions) {
// 					var i = 0;
// 					util.each(options.actions, function(action) {
// 						var fnString = utils.renderBoilerplateTemplate('action.ejs', {
// 							action: action,
// 							entity: entity,
// 							viewEngine: sails.config.views.engine,
// 							viewPath: require('underscore.string').rtrim(sails.config.paths.views, '/'),
// 							baseurl: '/' + entity
// 						});

// 						// Append a comma, unless this is the last
// 						if (options.actions.length !== i) {
							
// 							fnString = fnString + ',\n\n';

// 							// Append the action to the code string
// 							actions += fnString;
// 						}
// 						i++;
							
// 					});
// 				}
// 				return generate({
// 					boilerplate: 'controller.ejs',
// 					prefix: sails.config.paths.controllers,
// 					entity: utils.capitalize(entity),
// 					identity: entity.toLowerCase(),
// 					pluralIdentity: pluralize(entity),
// 					actions: actions,
// 					suffix: 'Controller.js'
// 				});
// 			}
// 		};



// 		/**
// 		 * Generate a Sails model file
// 		 *
// 		 * @api private
// 		 */

// 		this.generateModel = function (entity, options) {
// 			var attributes = '';

// 			// Add each requested attribute
// 			if (options && options.attributes) {
// 				util.each(options.attributes, function(attribute) {
// 					attribute.name = utils.verifyValidEntity(attribute.name, 'Invalid attribute: ' + attribute.name);

// 					var fnString = utils.renderBoilerplateTemplate('attribute.ejs', {
// 						attribute: attribute,
// 						entity: entity,
// 						viewEngine: sails.config.views.engine,
// 						viewPath: require('underscore.string').rtrim(sails.config.paths.views, '/'),
// 						baseurl: '/' + entity
// 					});

// 					// If this is not the first attribute, add a comma
// 					if (attributes !== '') {
// 						fnString = ',\n\n' + fnString;
// 					}
// 					attributes += fnString;
// 				});
// 			}
// 			return generate({
// 				boilerplate: 'model.ejs',
// 				prefix: sails.config.paths.models,
// 				entity: utils.capitalize(entity),
// 				attributes: attributes,
// 				suffix: '.js'
// 			});
// 		};


// 		/**
// 		 * Generate a Sails adapter file
// 		 *
// 		 * @api private
// 		 */

// 		this.generateAdapter = function (entity, options) {
// 			return generate({
// 				boilerplate: 'adapter.ejs',
// 				prefix: sails.config.paths.adapters,
// 				entity: utils.capitalize(entity),
// 				suffix: 'Adapter.js'
// 			});
// 		};


// 		/**
// 		 * Generate a Sails view file
// 		 * (depedent on viewEngine config)
// 		 *
// 		 * @api private
// 		 */

// 		this.generateView = function (entity, options) {
// 			var viewPath = sails.config.paths.views + '/' + entity;
// 			utils.generateDir(viewPath);

// 			util.each(options.actions, function(action) {
// 				action = utils.verifyValidEntity(action, 'Invalid view name: ' + action);

// 				return generate({
// 					boilerplate: 'view.' + sails.config.views.engine,
// 					prefix: viewPath,
// 					entity: entity,
// 					action: action,
// 					suffix: '.' + sails.config.views.engine
// 				});
// 			});
// 		};


// 		/**
// 		 * Utility method to generate a file given the boilerplate and output paths,
// 		 * as well as an optional ejs render override.
// 		 *
// 		 * @param options.entity
// 		 * @param options.action
// 		 *
// 		 * @api private
// 		 */

// 		function generate (options) {
// 			var boilerplateName = options.boilerplate.split('.')[0];
// 			sails.log.verbose('Generating ' + boilerplateName + ' for ' + options.entity + '...');

// 			// Trim slashes
// 			options.prefix = require('underscore.string').rtrim(options.prefix, '/') + '/';

// 			if (!options.entity) {
// 				throw new Error('No output file name specified!');
// 			}

// 			var file = utils.renderBoilerplateTemplate(options.boilerplate, options);

// 			var fileEntity = options.action || options.entity;
// 			var newFilePath = options.prefix + fileEntity + options.suffix;
// 			utils.verifyDoesntExist(newFilePath, 'A file or directory already exists at: ' + newFilePath);

// 			// Touch output file to make sure the path to it exists
// 			if (fs.createFileSync(newFilePath)) {
// 				sails.log.error('Could not create file, ' + newFilePath + '!');
// 				process.exit(1);
// 			}
// 			fs.writeFileSync(newFilePath, file);
// 		}

// 	}
// };

