/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var util = require('util');
var pluralize = require('pluralize');
var STRINGFILE = require('sails-stringfile');
var includeAll = require('include-all');
var BlueprintController = {
  create: require('./actions/create'),
  find: require('./actions/find'),
  findone: require('./actions/findOne'),
  update: require('./actions/update'),
  destroy: require('./actions/destroy'),
  populate: require('./actions/populate'),
  add: require('./actions/add'),
  remove: require('./actions/remove'),
  replace: require('./actions/replace'),
};



/**
 * Blueprints (Core Hook)
 *
 * Stability: 1 - Experimental
 * (see http://nodejs.org/api/documentation.html#documentation_stability_index)
 */

module.exports = function(sails) {

  /**
   * Private dependencies.
   * (need access to `sails`)
   */

  var onRoute = require('./onRoute')(sails);



  var hook;

  /**
   * Expose blueprint hook definition
   */
  return {

    /**
     * Default configuration to merge w/ top-level `sails.config`
     * @type {Object}
     */
    defaults: {

      // These config options are mixed into the route options (req.options)
      // and made accessible from the blueprint actions.  Most of them currently
      // relate to the shadow (i.e. implicit) routes which are created, and are
      // interpreted by this hook.
      blueprints: {

        // Blueprint/Shadow-Routes Enabled
        //
        // e.g. '/frog/jump': 'FrogController.jump'
        actions: true,
        // e.g. '/frog/find/:id?': 'FrogController.find'
        shortcuts: true,
        // e.g. 'get /frog/:id?': 'FrogController.find'
        rest: true,



        // Blueprint/Shadow-Route Modifiers
        //
        // e.g. 'get /api/v2/frog/:id?': 'FrogController.find'
        prefix: '',

        // Blueprint/REST-Route Modifiers
        // Will work only for REST and will extend `prefix` option
        //
        // e.g. 'get /api/v2/frog/:id?': 'FrogController.find'
        restPrefix: '',

        // e.g. 'get /frogs': 'FrogController.find'
        pluralize: false,



        // Configuration of the blueprint actions themselves:

        // Whether to populate all association attributes in the `find`
        // blueprint action.
        populate: true,

        // Whether to run `Model.watch()` in the `find` blueprint action.
        autoWatch: true,

        // Private per-controller config.
        _controllers: {}
      }

    },

    configure: function() {

      if (sails.config.blueprints.jsonp) {
        throw new Error('JSONP support was removed from the blueprints API in Sails 1.0 (detected sails.config.blueprints.jsonp === '  + sails.config.blueprints.jsonp + ')');
      }

    },

    /**
     * Internal list of action functions that may be bound via shadow routes.
     * @type {Object}
     */
    _actions: {},

    /**
     * Initialize is fired first thing when the hook is loaded.
     *
     * @param  {Function} cb
     */
    initialize: function (cb) {

      // Provide hook context to closures
      hook = this;

      // Set the _middlewareType of each blueprint action to 'BLUEPRINT: <action>'.
      _.each(BlueprintController, function(fn, key) {
        fn._middlewareType = 'BLUEPRINT: ' + key;
      });

      // Register route syntax for binding blueprints directly.
      // This is deprecated, so onRoute currently just logs a warning.
      sails.on('route:typeUnknown', onRoute);

      // Wait until after user routes have been bound to bind our
      // own "shadow routes" (action routes, RESTful routes,
      // shortcut routes and index routes).
      sails.on('router:after', hook.bindShadowRoutes);

      // If the ORM hook is active, wait for it to load, then create actions
      // for each model.
      if (sails.hooks.orm) {
        sails.after('hook:orm:loaded', function() {
          hook.registerActions(cb);
        });
      }
      // Otherwise we're done!
      else {
        return cb();
      }
    },


    bindShadowRoutes: function() {

      var logWarns = function(warns) {
        sails.log.blank();
        _.each(warns, function (warn) {
          sails.log.warn(warn);
        });
        STRINGFILE.logMoreInfoLink(STRINGFILE.get('links.docs.config.blueprints'), sails.log.warn);
      };

      // Local reference to the sails blueprints config.
      var config = sails.config.blueprints;

      // Get a copy of the Sails actions dictionary.
      var actions = sails.getActions();

      //  ┬  ┬┌─┐┬  ┬┌┬┐┌─┐┌┬┐┌─┐  ┌─┐┬─┐┌─┐┌─┐┬─┐ ┬┌─┐┌─┐
      //  └┐┌┘├─┤│  │ ││├─┤ │ ├┤   ├─┘├┬┘├┤ ├┤ │┌┴┬┘├┤ └─┐
      //   └┘ ┴ ┴┴─┘┴─┴┘┴ ┴ ┴ └─┘  ┴  ┴└─└─┘└  ┴┴ └─└─┘└─┘

      // Validate prefix for generated routes.
      if ( config.prefix ) {
        if ( !_(config.prefix).isString() ) {
          sails.after('lifted', function () {
            logWarns([
              util.format('Ignoring invalid blueprint prefix configured for controller `%s`.', globalId),
              '`prefix` should be a string, e.g. "/api/v1".'
            ]);
          });
          return;
        }
        if ( !config.prefix.match(/^\//) ) {
          var originalPrefix = config.prefix;
          sails.after('lifted', function () {
            logWarns([
              util.format('Invalid blueprint prefix ("%s") configured for controller `%s` (should start with a `/`).', originalPrefix, globalId),
              util.format('For now, assuming you meant:  "%s".', config.prefix)
            ]);
          });

          config.prefix = '/' + config.prefix;
        }
      }

      // Validate prefix for RESTful routes.
      if ( config.restPrefix ) {
        if ( !_(config.restPrefix).isString() ) {
          sails.after('lifted', function () {
            logWarns([
              util.format('Ignoring invalid blueprint rest prefix configured for controller `%s`.', globalId),
              '`restPrefix` should be a string, e.g. "/api/v1".'
            ]);
          });
          return;
        }
        if ( !config.restPrefix.match(/^\//) ) {
          var originalRestPrefix = config.restPrefix;
          sails.after('lifted', function () {
            logWarns([
              util.format('Invalid blueprint restPrefix ("%s") configured for controller `%s` (should start with a `/`).', originalRestPrefix, globalId),
              util.format('For now, assuming you meant:  "%s".', config.restPrefix)
            ]);
          });

          config.restPrefix = '/' + config.restPrefix;
        }
      }

      //  ╔═╗╔═╗╔╦╗╦╔═╗╔╗╔  ┬─┐┌─┐┬ ┬┌┬┐┌─┐┌─┐
      //  ╠═╣║   ║ ║║ ║║║║  ├┬┘│ ││ │ │ ├┤ └─┐
      //  ╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝  ┴└─└─┘└─┘ ┴ └─┘└─┘

      // If action routing is turned on, bind a route pointing
      // at each action in the Sails actions dictionary

      if ( config.actions ) {

        // Loop through each action in the dictionary
        _.each(actions, function(action, key) {
          // If this is a blueprint action, only skip it.
          // It'll be handled in the "shortcut routes" section,
          // if those routes are enabled.
          if (action._middlewareType && action._middlewareType.indexOf('BLUEPRINT') === 0) {
            return;
          }
          // If this action belongs to a controller with blueprint action routes turned off, skip it.
          if (_.any(config._controllers, function(config, controllerIdentity) {
            return config.actions === false && key.indexOf(controllerIdentity) === 0;
          })) {
            return;
          }

          // Add the route prefix (if any) and bind the route to that URL.
          var url = config.prefix + '/' + key;
          sails.router.bind(url, key);
        });

      }


      //  ╔═╗╦ ╦╔═╗╦═╗╔╦╗╔═╗╦ ╦╔╦╗  ┬─┐┌─┐┬ ┬┌┬┐┌─┐┌─┐
      //  ╚═╗╠═╣║ ║╠╦╝ ║ ║  ║ ║ ║   ├┬┘│ ││ │ │ ├┤ └─┐
      //  ╚═╝╩ ╩╚═╝╩╚═ ╩ ╚═╝╚═╝ ╩   ┴└─└─┘└─┘ ┴ └─┘└─┘

      // If shortcut blueprint routing is turned on, bind CRUD routes
      // for each model using GET-only urls.
      if ( config.shortcuts ) {

        // Loop through each model.
        _.each(sails.models, function(Model, identity) {

          // If this there is a matching controller with blueprint shortcut routes turned off, skip it.
          if (_.any(config._controllers, function(config, controllerIdentity) {
            return config.shortcuts === false && identity === controllerIdentity;
          })) {
            return;
          }

          // Determine the base route for the model.
          var baseShortcutRoute = (function() {
            // Start with the model identity.
            var baseRouteName = identity;
            // Pluralize it if plurization option is on.
            if (config.pluralize) {
              baseRouteName = pluralize(baseRouteName);
            }
            // Add the route prefix and base route name together.
            return config.prefix + '/' + baseRouteName;
          })();

          _bindShortcutRoute('get %s/find', 'find');
          _bindShortcutRoute('get %s/find/:id', 'findOne');
          _bindShortcutRoute('get %s/create', 'create');
          _bindShortcutRoute('get %s/update/:id', 'update');
          _bindShortcutRoute('get %s/destroy/:id', 'destroy');

          // Bind "rest" blueprint/shadow routes based on known associations in our model's schema
          // Bind add/remove for each `collection` associations
          _(Model.associations).where({type: 'collection'}).forEach(function (association) {
            var alias = association.alias;
            sails.log.silly('Binding shortcut association blueprint `'+alias+'` for',identity);

            _bindAssocRoute('get %s/:parentid/%s/add/:childid', 'add', alias);
            _bindAssocRoute('get %s/:parentid/%s/replace', 'replace', alias);
            _bindAssocRoute('get %s/:parentid/%s/remove/:childid', 'remove', alias);
          }).value();

          // and populate for both `collection` and `model` associations,
          // if we didn't already do it above for RESTful routes
          if ( !config.rest ) {
            _(Model.associations).forEach(function (association) {
              var alias = association.alias;
              sails.log.silly('Binding shortcut association blueprint `'+alias+'` for',identity);

              _bindAssocRoute('get %s/:parentid/%s/:id?', 'populate', alias );
            }).value();
          }

          function _bindShortcutRoute(template, blueprintActionName) {
            var shortcutRoute = util.format(template, baseShortcutRoute);
            sails.router.bind(shortcutRoute, identity + '/' + blueprintActionName, null, { model: identity, associations: _.cloneDeep(Model.associations), populate: sails.config.blueprints.populate, autoWatch: sails.config.blueprints.autoWatch });
          }

          function _bindAssocRoute(template, blueprintActionName, alias) {
            var assocRoute = util.format(template, baseShortcutRoute, alias);
            sails.router.bind(assocRoute, identity + '/' + blueprintActionName, null, { model: identity, alias: alias, associations: _.cloneDeep(Model.associations), populate: sails.config.blueprints.populate, autoWatch: sails.config.blueprints.autoWatch  });
          }

        });
      }

      //  ╦═╗╔═╗╔═╗╔╦╗  ┬─┐┌─┐┬ ┬┌┬┐┌─┐┌─┐
      //  ╠╦╝║╣ ╚═╗ ║   ├┬┘│ ││ │ │ ├┤ └─┐
      //  ╩╚═╚═╝╚═╝ ╩   ┴└─└─┘└─┘ ┴ └─┘└─┘

      // If RESTful blueprint routing is turned on, bind CRUD routes
      // for each model.
      if ( config.rest ) {

        // Loop throug each model.
        _.each(sails.models, function(Model, identity) {

          // If this there is a matching controller with blueprint shortcut routes turned off, skip it.
          if (_.any(config._controllers, function(config, controllerIdentity) {
            return config.rest === false && identity === controllerIdentity;
          })) {
            return;
          }

          // Determine the base REST route for the model.
          var baseRestRoute = (function() {
            // Start with the model identity.
            var baseRouteName = identity;
            // Pluralize it if plurization option is on.
            if (config.pluralize) {
              baseRouteName = pluralize(baseRouteName);
            }
            // Add the route prefix, RESTful route prefix and base route name together.
            return config.prefix + config.restPrefix + '/' + baseRouteName;
          })();

          _bindRestRoute('get %s', 'find');
          _bindRestRoute('get %s/:id', 'findOne');
          _bindRestRoute('post %s', 'create');
          _bindRestRoute('patch %s/:id', 'update');
          _bindRestRoute('delete %s/:id?', 'destroy');

          // Bind the `put :model/:id` route to the update action, but wrap it in a
          // function that logs a warning first.
          sails.router.bind(
            util.format('put %s/:id', baseRestRoute),
            function (req, res, next) {
              sails.log.debug('Using `PUT` to update a record is deprecated in Sails 1.0.  Use `PATCH` instead!');
              return sails.getActions()[identity + '/update'](req, res, next);
            },
            null,
            { model: identity, associations: _.cloneDeep(Model.associations), populate: sails.config.blueprints.populate, autoWatch: sails.config.blueprints.autoWatch  }
          );

          // Bind "rest" blueprint/shadow routes based on known associations in our model's schema
          // Bind add/remove for each `collection` associations
          _(Model.associations).where({type: 'collection'}).forEach(function (association) {
            var alias = association.alias;
            sails.log.silly('Binding RESTful association blueprint `'+alias+'` for',identity);

            _bindAssocRoute('put %s/:parentid/%s/:childid', 'add', alias);
            _bindAssocRoute('put %s/:parentid/%s', 'replace', alias);
            _bindAssocRoute('delete %s/:parentid/%s/:childid', 'remove', alias);

          }).value();

          // and populate for both `collection` and `model` associations
          _(Model.associations).forEach(function (association) {
            var alias = association.alias;
            sails.log.silly('Binding RESTful association blueprint `'+alias+'` for',identity);

            _bindAssocRoute('get %s/:parentid/%s/:id?', 'populate', alias );
          }).value();

          function _bindRestRoute(template, blueprintActionName) {
            var restRoute = util.format(template, baseRestRoute);
            sails.router.bind(restRoute, identity + '/' + blueprintActionName, null, { model: identity, associations: _.cloneDeep(Model.associations), populate: sails.config.blueprints.populate, autoWatch: sails.config.blueprints.autoWatch  });
          }

          function _bindAssocRoute(template, blueprintActionName, alias) {
            var assocRoute = util.format(template, baseRestRoute, alias);
            sails.router.bind(assocRoute, identity + '/' + blueprintActionName, null, { model: identity, alias: alias, associations: _.cloneDeep(Model.associations), populate: sails.config.blueprints.populate, autoWatch: sails.config.blueprints.autoWatch  });
          }

        });

      }

      //  ╦╔╗╔╔╦╗╔═╗═╗ ╦  ┬─┐┌─┐┬ ┬┌┬┐┌─┐┌─┐
      //  ║║║║ ║║║╣ ╔╩╦╝  ├┬┘│ ││ │ │ ├┤ └─┐
      //  ╩╝╚╝═╩╝╚═╝╩ ╚═  ┴└─└─┘└─┘ ┴ └─┘└─┘
      //
      //  If action routing is turned on, bind a route pointing
      //  any action ending in `/index` to the base of that
      //  action's path, e.g. 'user.index' => '/user'

      if ( config.actions ) {

        // Loop through each action in the dictionary
        _.each(actions, function(action, key) {
          // Does the key end in `/index` (or is it === `index`)?
          if (key === 'index' || key.match(/\/index$/)) {

            // If this action belongs to a controller with blueprint action routes turned off, skip it.
            if (_.any(config._controllers, function(config, controllerIdentity) {
              return config.actions === false && key.indexOf(controllerIdentity) === 0;
            })) {
              return;
            }

            // Strip the `.index` off the end.
            var index = key.replace(/\/?index$/,'');
            // Replace any remaining dots with slashes.
            var url = '/' + index;
            // Bind the url to the action.
            sails.router.bind(url, key);
          }
        });

      }

    },

    registerActions: function(cb) {
      // Loop through all of the loaded models and add actions for each.
      _.each(_.keys(sails.models), function(modelIdentity) {
        sails.registerAction(BlueprintController.create, modelIdentity + '/create');
        sails.registerAction(BlueprintController.find, modelIdentity + '/find');
        sails.registerAction(BlueprintController.findone, modelIdentity + '/findOne');
        sails.registerAction(BlueprintController.update, modelIdentity + '/update');
        sails.registerAction(BlueprintController.destroy, modelIdentity + '/destroy');
        sails.registerAction(BlueprintController.populate, modelIdentity + '/populate');
        sails.registerAction(BlueprintController.add, modelIdentity + '/add');
        sails.registerAction(BlueprintController.remove, modelIdentity + '/remove');
        sails.registerAction(BlueprintController.replace, modelIdentity + '/replace');
      });
      return cb();
    }

  };

};
