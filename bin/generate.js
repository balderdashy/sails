module.exports = function (sails) {


	/**
	 * Module dependencies.
	 */

	var _			= require( 'lodash' ),
		utils		= require( './utils' )(sails),
		fs			= utils.fs,
		pluralize	= require('pluralize');


	/**
	 * Expose new instance of `Generator`
	 */

	return new Generator();


	function Generator ( ) {


		/**
		 * Generate a Sails controller file
		 *
		 * @api private
		 */

		this.generateController = function (entity, options) {
			var newControllerPath = sails.config.paths.controllers + '/' + utils.capitalize(entity) + 'Controller.js';
			var newFederatedControllerPath = sails.config.paths.controllers + '/' + entity;

			utils.verifyDoesntExist(newControllerPath, 'A controller already exists at: ' + newControllerPath);
			utils.verifyDoesntExist(newFederatedControllerPath, 'A controller already exists at: ' + newFederatedControllerPath);

      if (options && (options.c || options.coffee)){
        language = 'coffee';
      }
      else if (sails.config.controllers.language){
        language = sails.config.controllers.language;
      }
      else{
        language = 'js';
      }

			// Federated controller
			if (options && (options.f || options.federated)) {

				utils.generateDir('./' + newFederatedControllerPath);
				_.each(options.actions, function(action) {

					action = utils.verifyValidEntity(action, 'Invalid action name: ' + action);

					return generate({
						boilerplate: language + '/federatedAction.ejs',
						prefix: sails.config.paths.controllers + '/' + entity,
						entity: entity,
						identity: entity.toLowerCase(),
						pluralIdentity: pluralize(entity),
						action: action,
						viewEngine: sails.config.views.engine,
						viewPath: require('underscore.string').rtrim(sails.config.paths.views, '/'),
						baseurl: '/' + entity,
						suffix: '.' + language
					});
				});
			}
			// Monolithic controller
			else {
				var actions = '';

				// Add each requested function
				if (options && options.actions) {
					var i = 0;
					_.each(options.actions, function(action) {
						var fnString = utils.renderBoilerplateTemplate(pathPrefix + 'action.ejs', {
							action: action,
							entity: entity,
							viewEngine: sails.config.views.engine,
							viewPath: require('underscore.string').rtrim(sails.config.paths.views, '/'),
							baseurl: '/' + entity
						});

						// Append a comma, unless this is the last
						if (options.actions.length !== i) {
							
							if (generateCoffee) fnString = fnString + '\n';
              else fnString = fnString + ',\n';

							// Append the action to the code string
							actions += fnString;
						}
						i++;
							
					});
				}
				return generate({
					boilerplate: language + '/controller.ejs',
					prefix: sails.config.paths.controllers,
					entity: utils.capitalize(entity),
					identity: entity.toLowerCase(),
					pluralIdentity: pluralize(entity),
					actions: actions,
					suffix: 'Controller' + '.' + language
				});
			}
		};



		/**
		 * Generate a Sails model file
		 *
		 * @api private
		 */

		this.generateModel = function (entity, options) {
			var attributes = '';

      if (options && (options.c || options.coffee)){
        language = 'coffee';
      }
      // There is no models.js config
      // else if (sails.config.models.language){
      //   language = sails.config.models.language;
      // }
      else{
        language = 'js';
      }

			// Add each requested attribute
			if (options && options.attributes) {
				_.each(options.attributes, function(attribute) {
					attribute.name = utils.verifyValidEntity(attribute.name, 'Invalid attribute: ' + attribute.name);

					var fnString = '\n' + utils.renderBoilerplateTemplate(pathPrefix + 'attribute.ejs', {
						attribute: attribute,
						entity: entity,
						viewEngine: sails.config.views.engine,
						viewPath: require('underscore.string').rtrim(sails.config.paths.views, '/'),
						baseurl: '/' + entity
					});

					// If this is not the first attribute, add a comma
					if (attributes !== '') {
						if (generateCoffee) fnString = '\n' + fnString;
            else fnString = ',\n' + fnString;
					}
					attributes += fnString;
				});
			}
			return generate({
				boilerplate: language + '/model.ejs',
				prefix: sails.config.paths.models,
				entity: utils.capitalize(entity),
				attributes: attributes,
				suffix: '.' + language
			});
		};


		/**
		 * Generate a Sails adapter file
		 *
		 * @api private
		 */

		this.generateAdapter = function (entity, options) {

      if (options && (options.c || options.coffee)){
        language = 'coffee';
      }
      else if (sails.config.adapters.language){
        language = sails.config.adapters.language;
      }
      else{
        language = 'js';
      }

			return generate({
				boilerplate: language + '/adapter.ejs',
				prefix: sails.config.paths.adapters,
				entity: utils.capitalize(entity),
				suffix: 'Adapter.' + language
			});
		};


		/**
		 * Generate a Sails view file
		 * (depedent on viewEngine config)
		 *
		 * @api private
		 */

		this.generateView = function (entity, options) {
			var viewPath = sails.config.paths.views + '/' + entity;
			utils.generateDir(viewPath);

			_.each(options.actions, function(action) {
				action = utils.verifyValidEntity(action, 'Invalid view name: ' + action);

				return generate({
					boilerplate: 'view.' + sails.config.views.engine,
					prefix: viewPath,
					entity: entity,
					action: action,
					suffix: '.' + sails.config.views.engine
				});
			});
		};


		/**
		 * Utility class to generate a file given the boilerplate and output paths,
		 * as well as an optional ejs render override.
		 *
		 * @api private
		 */

		function generate (options) {
			var boilerplateName = options.boilerplate.split('.')[0];
			sails.log.verbose('Generating ' + boilerplateName + ' for ' + options.entity + '...');

			// Trim slashes
			options.prefix = require('underscore.string').rtrim(options.prefix, '/') + '/';

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

	}
};

