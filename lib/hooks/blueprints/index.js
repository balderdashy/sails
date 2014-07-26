/**
 * Module dependencies
 */

var _ = require('lodash')
  , util = require('util')
  , async = require('async')
  , pluralize = require('pluralize')
  , BlueprintController = {
      create  : require('./actions/create')
    , find    : require('./actions/find')
    , findone : require('./actions/findOne')
    , update  : require('./actions/update')
    , destroy : require('./actions/destroy')
    , populate: require('./actions/populate')
    , add     : require('./actions/add')
    , remove  : require('./actions/remove')
  }
  , STRINGFILE = require('sails-stringfile');


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
        // e.g. '/frog': 'FrogController.index'
        index: true,
        // e.g. '/frog/find/:id?': 'FrogController.find'
        shortcuts: true,
        // e.g. 'get /frog/:id?': 'FrogController.find'
        rest: true,



        // Blueprint/Shadow-Route Modifiers
        //
        // e.g. 'get /api/v2/frog/:id?': 'FrogController.find'
        prefix: '',
        // e.g. 'get /frogs': 'FrogController.find'
        pluralize: false,





        // Configuration of the blueprint actions themselves:

        // Whether to populate all association attributes in the `find`
        // blueprint action.
        populate: true,

        // Whether to run `Model.watch()` in the `find` blueprint action.
        autoWatch: true,


        // (TODO: generated comments for jsonp configuration needs to be updated w/ new options)
        // (TODO: need to mention new `req.options` stuff in generated comments)

        // // Enable JSONP callbacks.
        // jsonp: false

        // Deprecated:
        // Skip blueprint if `:id?` is NOT an integer.
        // expectIntegerId: false,
      }

    },



    /**
     * Initialize is fired first thing when the hook is loaded.
     *
     * @param  {Function} cb
     */
    initialize: function (cb) {

      // Provide hook context to closures
      hook = this;

      ////////////////////////////////////////////////////////////////////////
      // TODO:
      // Provide deprecation notice letting 0.9 users know that they need to
      // move their blueprint configuration to `config.blueprints` instead of
      // `config.controllers.blueprints`.  Similarly, need a message to let
      // folks know to move their controller-specific blueprint config from
      // `SomeController._config.blueprints` to `SomeController._config`.
      // In both cases, we can "fix" the configuration in-memory, avoiding
      // allowing the app to "still work". This can be done the same way we're
      // doing it for adapter config.
      ////////////////////////////////////////////////////////////////////////

      // Register route syntax for binding blueprints directly.
      sails.on('route:typeUnknown', onRoute);

      // Set up listener to bind shadow routes when the time is right.
      //
      // Always wait until after router has bound static routes.
      // If policies hook is enabled, also wait until policies are bound.
      // If orm hook is enabled, also wait until models are known.
      // If controllers hook is enabled, also wait until controllers are known.
      var eventsToWaitFor = [];
      eventsToWaitFor.push('router:after');
      if (sails.hooks.policies) {
        eventsToWaitFor.push('hook:policies:bound');
      }
      if (sails.hooks.orm) {
        eventsToWaitFor.push('hook:orm:loaded');
      }
      if (sails.hooks.controllers) {
        eventsToWaitFor.push('hook:controllers:loaded');
      }
      sails.after(eventsToWaitFor, hook.bindShadowRoutes);

      // Load blueprint middleware and continue.
      loadMiddleware(cb);
    },

    extendControllerMiddleware: function() {
      _.each(sails.middleware.controllers, function (controller) {
        _.defaults(controller, hook.middleware);
      });
    },

    bindShadowRoutes: function() {

      _.each(sails.middleware.controllers, function eachController (controller, controllerId) {
        if ( !_.isObject(controller) || _.isArray(controller) ) return;

        // Get globalId for use in errors/warnings
        var globalId = sails.controllers[controllerId].globalId;

        // Determine blueprint configuration for this controller
        var config = _.merge({},
          sails.config.blueprints,
          controller._config || {});

        // Validate blueprint config for this controller
        if ( config.prefix ) {
          if ( !_(config.prefix).isString() ) {
            sails.after('lifted', function () {
              sails.log.blank();
              sails.log.warn(util.format('Ignoring invalid blueprint prefix configured for controller `%s`.', globalId));
              sails.log.warn('`prefix` should be a string, e.g. "/api/v1".');
              STRINGFILE.logMoreInfoLink(STRINGFILE.get('links.docs.config.blueprints'), sails.log.warn);
            });
            return;
          }
          if ( !config.prefix.match(/^\//) ) {
            var originalPrefix = config.prefix;
            sails.after('lifted', function () {
              sails.log.blank();
              sails.log.warn(util.format('Invalid blueprint prefix ("%s") configured for controller `%s` (should start with a `/`).', originalPrefix, globalId));
              sails.log.warn(util.format('For now, assuming you meant:  "%s".', config.prefix));
              STRINGFILE.logMoreInfoLink(STRINGFILE.get('links.docs.config.blueprints'), sails.log.warn);
            });

            config.prefix = '/' + config.prefix;
          }
        }

        // Determine the names of the controller's user-defined actions
        // IMPORTANT: Use `sails.controllers` instead of `sails.middleware.controllers`
        // (since `sails.middleware.controllers` will have blueprints already mixed-in,
        // and we want the explicit actions defined in the app)
        var actions = Object.keys(sails.controllers[controllerId]);



        // Determine base route
        var baseRoute = config.prefix + '/' + controllerId;
        if (config.pluralize) {
          baseRoute = pluralize(baseRoute);
        }

        // Build route options for blueprint
        var routeOpts = config;

        // Bind "actions" and "index" shadow routes for each action
        _.each(actions, function eachActionID (actionId) {

          var opts = _.merge({
            action: actionId,
            controller: controllerId
          }, routeOpts);

          // Bind a route based on the action name, if `actions` shadows enabled
          if (config.actions) {
            var actionRoute = baseRoute + '/' + actionId.toLowerCase() + '/:id?';
            sails.log.silly('Binding action ('+actionId.toLowerCase()+') blueprint/shadow route for controller:',controllerId);
            sails.router.bind(actionRoute, controller[actionId.toLowerCase()], null, opts);
          }

          // Bind base route to index action, if `index` shadows are not disabled
          if (config.index !== false && actionId.match(/^index$/i)) {
            sails.log.silly('Binding index blueprint/shadow route for controller:',controllerId);
            sails.router.bind(baseRoute, controller.index, null, opts);
          }
        });

        // Determine the model connected to this controller either by:
        // -> explicit configuration
        // -> on the controller
        // -> on the routes config
        // -> or implicitly by globalId
        // -> or implicitly by controller id
        var routeConfig = sails.router.explicitRoutes[controllerId] || {};
        var modelFromGlobalId = sails.util.findWhere(sails.models, {globalId: globalId});
        var modelId = config.model || routeConfig.model || (modelFromGlobalId && modelFromGlobalId.identity) || controllerId;

        // If the orm hook is enabled, it has already been loaded by this time,
        // so just double-check to see if the attached model exists in `sails.models`
        // before trying to attach any CRUD blueprint actions to the controller.
        if (sails.hooks.orm && sails.models && sails.models[modelId]) {

          // If a model with matching identity exists,
          // extend route options with the id of the model.
          routeOpts.model = modelId;

          var Model = sails.models[modelId];

          // Bind convenience functions for readability below:

          // Given an action id like "find" or "create", returns the appropriate
          // blueprint action (or explicit controller action if the controller
          // overrode the blueprint CRUD action.)
          var _getAction = _.partial(_getMiddlewareForShadowRoute, controllerId);

          // Returns a customized version of the route template as a string.
          var _getRoute = _.partialRight(util.format,baseRoute);


          // Mix in the known associations for this model to the route options.
          routeOpts = _.merge({ associations: _.cloneDeep(Model.associations) }, routeOpts);

          // Binds a route to the specifed action using _getAction, and sets the action and controller
          // options for req.options
          var _bindRoute = function (path, action, options) {
            options = options || routeOpts;
            options = _.extend({}, options, {action: action, controller: controllerId});
            sails.router.bind ( path, _getAction(action), null, options);

          };

          // Bind URL-bar "shortcuts"
          // (NOTE: in a future release, these may be superceded by embedding actions in generated controllers
          //  and relying on action blueprints instead.)
          if ( config.shortcuts ) {
            sails.log.silly('Binding shortcut blueprint/shadow routes for model ', modelId, ' on controller:', controllerId);

            _bindRoute(_getRoute('%s/find'), 'find');
            _bindRoute(_getRoute('%s/find/:id'), 'findOne');
            _bindRoute(_getRoute('%s/create'), 'create');
            _bindRoute(_getRoute('%s/update/:id'), 'update');
            _bindRoute(_getRoute('%s/destroy/:id?'), 'destroy');

            // Bind add/remove "shortcuts" for each `collection` associations
            _(Model.associations).where({type: 'collection'}).forEach(function (association) {
              var alias = association.alias;
              var _getAssocRoute = _.partialRight(util.format, baseRoute, alias);
              var opts = _.merge({ alias: alias }, routeOpts);

              sails.log.silly('Binding "shortcuts" to association blueprint `'+alias+'` for',controllerId);
              _bindRoute( _getAssocRoute('%s/:parentid/%s/add/:id?'),      'add' , opts );
              _bindRoute( _getAssocRoute('%s/:parentid/%s/remove/:id?'),   'remove', opts );
            });
          }

          // Bind "rest" blueprint/shadow routes
          if ( config.rest ) {
            sails.log.silly('Binding RESTful blueprint/shadow routes for model+controller:',controllerId);

            _bindRoute(_getRoute('get %s'), 'find');
            _bindRoute(_getRoute('get %s/:id'), 'findOne');
            _bindRoute(_getRoute('post %s'), 'create');
            _bindRoute(_getRoute('put %s/:id'), 'update');
            _bindRoute(_getRoute('post %s/:id'), 'update');
            _bindRoute(_getRoute('delete %s/:id?'), 'destroy');

            // Bind "rest" blueprint/shadow routes based on known associations in our model's schema
            // Bind add/remove for each `collection` associations
            _(Model.associations).where({type: 'collection'}).forEach(function (association) {
              var alias = association.alias;
              var _getAssocRoute = _.partialRight(util.format, baseRoute, alias);
              var opts = _.merge({ alias: alias }, routeOpts);
              sails.log.silly('Binding RESTful association blueprint `'+alias+'` for',controllerId);

              _bindRoute( _getAssocRoute('post %s/:parentid/%s/:id?'),     'add', opts );
              _bindRoute( _getAssocRoute('delete %s/:parentid/%s/:id?'),   'remove', opts );
            });

            // and populate for both `collection` and `model` associations
            _(Model.associations).forEach(function (association) {
              var alias = association.alias;
              var _getAssocRoute = _.partialRight(util.format, baseRoute, alias);
              var opts = _.merge({ alias: alias }, routeOpts);
              sails.log.silly('Binding RESTful association blueprint `'+alias+'` for',controllerId);

              _bindRoute( _getAssocRoute('get %s/:parentid/%s/:id?'), 'populate', opts );
            });
          }
        }
      });


      /**
       * Return the middleware function that should be bound for a shadow route
       * pointing to the specified blueprintId. Will use the explicit controller
       * action if it exists, otherwise the blueprint action.
       *
       * @param  {String} controllerId
       * @param  {String} blueprintId  [find, create, etc.]
       * @return {Function}            [middleware]
       */
      function _getMiddlewareForShadowRoute (controllerId, blueprintId) {

        // Allow custom actions defined in controller to override blueprint actions.
        return sails.middleware.controllers[controllerId][blueprintId.toLowerCase()] || hook.middleware[blueprintId];
      }
    }

  };




  /**
   * Bind blueprint/shadow routes for each controller.
   */
  function bindShadowRoutes () {}



  /**
   * (Re)load middleware.
   *
   * First, built-in blueprint actions in core Sails will be loaded.
   * Then, we'll attempt to load any custom blueprint definitions from
   * the user app using moduleloader.
   *
   * @api private
   */

  function loadMiddleware (cb) {
    sails.log.verbose('Loading blueprint middleware...');

    // Start off w/ the built-in blueprint actions (generic CRUD logic)
    BlueprintController;

    // Get custom blueprint definitions
    sails.modules.loadBlueprints(function modulesLoaded (err, modules) {
      if (err) return cb(err);

      // Merge custom overrides from our app into the BlueprintController
      // in Sails core.
      _.extend(BlueprintController, modules);

      // Add _middlewareType keys to the functions, for debugging
      _.each(BlueprintController, function(fn, key) {
        fn._middlewareType = 'BLUEPRINT: '+fn.name || key;
      });

      // Save reference to blueprints middleware in hook.
      hook.middleware = BlueprintController;

      // When our app's controllers are finished loading,
      // merge the blueprint actions into each of them as defaults.
      sails.once('middleware:registered', hook.extendControllerMiddleware);

      return cb(err);
    });
  }

};

