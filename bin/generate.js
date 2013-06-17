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
	generateView: generateView
};

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

function destroyController(entity) {
  return destroy({
    boilerplate: 'controller.ejs',
    prefix: sails.config.paths.controllers,
    entity: utils.capitalize(entity),
    suffix: "Controller.js"
  });
}

function destroyModel(entity) {
	return destroy({
		boilerplate: 'model.ejs',
		prefix: sails.config.paths.models,
		entity: utils.capitalize(entity),
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

function destory(options) {
  var boilerplateName = options.boilerplate.split('.')[0];
  sails.log.debug('Destroying ' + boilerplateName + ' for ' + options.entity + '...');

  options.prefix = _.str.rtrim(options.prefix, '/') + '/';

  if (!options.entity) {
    throw new Error('No output file name specified!');
  }

  var file = utils.renderBoilerplateTemplate(options.boilerplate, options);

  var fileEntity = options.action || options.entity;
  var filePath = options.prefix + fileEntity + options.suffix;

  if utils.fileExists(filePath) {
    fs.unlink(filePath)
  } else {
    sails.log.error('Could not delete file, ' + filePath + '!');
  }

}
