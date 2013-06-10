var _ = require('lodash');
_.str = require('underscore.string');
var fs = require('fs-extra');
var utils = require('./utils.js');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

// Build mock sails object
var sails = require('./mockSails.js');

module.exports = {
	generateController: generateController,
	generateModel: generateModel,
	generateAdapter: generateAdapter,
	generateView: generateView,
	generateTest: generateTest
};

function generateTest(entity, options) {
	var controllerName = sails.config.paths.controllers + '/' + utils.capitalize(entity) + 'Controller.js';

	if (!utils.fileExists(controllerName)) {
		sails.log.debug("Controller " + controllerName + " doesn' exist");
		process.exit(1)
	}

	// we have a winner - matched a controller
	var newTestPath = sails.config.paths.tests + '/controller/' + utils.capitalize(entity) + 'Controller.js';

	// Some sanity checking to allow tests to be regenerated
	options.force = options.force || false;
	if (utils.fileExists(newTestPath)) {
		if (!options.force) {
			sails.log.debug("Test " + newTestPath + " already exists - use --force to recreate it or use the usual bypass approach to merge tests");
		} else {
			sails.log.warn("Test " + newTestPath + " already exists - overwriting");
		}
	}
	// let's load the controller
	var controller = require(controllerName);

	// Lets see what methods it has
	var controllerActions = _.keys(controller);
	//sails.log.verbose("actions", controllerActions, options.actions); // Debugging

	if (!_.isEmpty(options.actions)) {
		// We've been actions from the command line - so some sanity checking is needed
		if (!_.isArray(options.actions)) {
			options.actions = [options.actions];
		}

		// Check all the passed actions actually exist
		var actionsInController = _.every(options.actions,
			function(action){
				return _.contains(controllerActions, String(action));
			}
		);

		if (!actionsInController) {
			// a little overhead for a more descriptive message
			var missingActions = _.collect(options.actions,
				function(action){
					if (!_.contains(controllerActions, String(action))) {
						return action;
					} else {
						return false;
					}
				}
			);
			sails.log.error("The actions '" + _.compact(missingActions).join(", ") + "' don't exist in "+controllerName);
			process.exit(1);
		}
	} else {
		// No actions passed - so lets' do it for all the actions in the controller
		options.actions = controllerActions;
	}

	// Ok - we have a controller, we have a match with the actions passed to those in the controller
	// So we can start creating things

	// This is a backup really - for existing projects that have upgraded sails
	if (!utils.fileExists(sails.config.paths.tests)) {
		utils.generateDir(sails.config.paths.tests);
	}
	if (!utils.fileExists(sails.config.paths.tests + '/controller/')) {
		utils.generateDir(sails.config.paths.tests + '/controller/');
	}

	var genTestActions = _.map(options.actions, function(action) {
		var fnString = utils.renderBoilerplateTemplate('api-test-methods.ejs', {
			controller: entity.toLowerCase(),
			action: action,
			entity: entity,
		});
		return fnString;
	});

	// and push it out
	return generate({
		boilerplate: 'api-test.ejs',
		prefix: sails.config.paths.tests+"/controller",
		entity: utils.capitalize(entity),
		actions: genTestActions.join("\n\n"),
		suffix: "Controller.js"
	});

}

function generateController(entity, options) {
	var newControllerPath = sails.config.paths.controllers + '/' + utils.capitalize(entity) + 'Controller.js';
	var newFederatedControllerPath = sails.config.paths.controllers + '/' + entity;

	utils.verifyDoesntExist(newControllerPath, "A controller already exists at: " + newControllerPath);
	utils.verifyDoesntExist(newFederatedControllerPath, "A controller already exists at: " + newFederatedControllerPath);

	// Federated controller
	if (options && (options.f || options.federated)) {

		utils.generateDir('./' + newFederatedControllerPath);
		_.each(options.actions, function(action) {

			action = utils.verifyValidEntity(action, "Invalid action name: " + action);

			return generate({
				boilerplate: 'federatedAction.ejs',
				prefix: sails.config.paths.controllers + '/' + entity,
				entity: entity,
				action: action,
				viewEngine: sails.config.viewEngine,
				viewPath: _.str.rtrim(sails.config.paths.views, '/'),
				baseurl: '/' + entity,
				suffix: ".js"
			});
		});
	}
	// Monolithic controller
	else {
		var actions = "";

		// Add each requested function
		if (options && options.actions) {
			_.each(options.actions, function(action) {
				var fnString = utils.renderBoilerplateTemplate('action.ejs', {
					action: action,
					entity: entity,
					viewEngine: sails.config.viewEngine,
					viewPath: _.str.rtrim(sails.config.paths.views, '/'),
					baseurl: '/' + entity
				});

				// If this is not the first action, add a comma
				if (actions !== "") {
					fnString = ',\n\n' + fnString;
				}
				actions += fnString;
			});
		}
		return generate({
			boilerplate: 'controller.ejs',
			prefix: sails.config.paths.controllers,
			entity: utils.capitalize(entity),
			actions: actions,
			suffix: "Controller.js"
		});
	}
}

function generateModel(entity, options) {
	var attributes = "";

	// Add each requested attribute
	if (options && options.attributes) {
		_.each(options.attributes, function(attribute) {
			attribute.name = utils.verifyValidEntity(attribute.name, "Invalid attribute: " + attribute.name);

			var fnString = utils.renderBoilerplateTemplate('attribute.ejs', {
				attribute: attribute,
				entity: entity,
				viewEngine: sails.config.viewEngine,
				viewPath: _.str.rtrim(sails.config.paths.views, '/'),
				baseurl: '/' + entity
			});

			// If this is not the first attribute, add a comma
			if (attributes !== "") {
				fnString = ',\n\n' + fnString;
			}
			attributes += fnString;
		});
	}
	return generate({
		boilerplate: 'model.ejs',
		prefix: sails.config.paths.models,
		entity: utils.capitalize(entity),
		attributes: attributes,
		suffix: ".js"
	});
}

function generateAdapter(entity, options) {
	return generate({
		boilerplate: 'adapter.ejs',
		prefix: sails.config.paths.adapters,
		entity: utils.capitalize(entity),
		suffix: "Adapter.js"
	});
}

function generateView(entity, options) {
	var viewPath = sails.config.paths.views + '/' + entity;
	utils.generateDir(viewPath);

	_.each(options.actions, function(action) {
		action = utils.verifyValidEntity(action, "Invalid view name: " + action);

		return generate({
			boilerplate: 'view.' + sails.config.viewEngine,
			prefix: viewPath,
			entity: entity,
			action: action,
			suffix: '.' + sails.config.viewEngine
		});
	});
}

// Utility class to generate a file given the boilerplate and output paths,
// as well as an optional ejs render override.
function generate(options) {
	var boilerplateName = options.boilerplate.split('.')[0];
	sails.log.debug('Generating ' + boilerplateName + ' for ' + options.entity + '...');

	// Trim slashes
	options.prefix = _.str.rtrim(options.prefix, '/') + '/';

	if (!options.entity) {
		throw new Error('No output file name specified!');
	}

	var file = utils.renderBoilerplateTemplate(options.boilerplate, options);

	var fileEntity = options.action || options.entity;
	var newFilePath = options.prefix + fileEntity + options.suffix;
	utils.verifyDoesntExist(newFilePath, 'A file or directory already exists at: ' + newFilePath);

	// Touch output file to make sure the path to it exists
	if (fs.createFileSync(newFilePath)) {
		sails.log.error('Could not create file, ' + newFilePath + '!');
		process.exit(1);
	}
	fs.writeFileSync(newFilePath, file);
}
