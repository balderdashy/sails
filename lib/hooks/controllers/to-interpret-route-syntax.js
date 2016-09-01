/**
 * Module dependencies.
 */

var _ = require('lodash');
var sailsUtil = require('sails-util');


/**
 * @param  {SailsApp} sails  [Sails app]
 * @return {Function}
 */
module.exports = function to(sails) {

  /**
   * `interpretRouteSyntax()`
   *
   * "Teach" router to understand references to controllers.
   * This is the event handler for the 'route:typeUnknown' emitted on `sails`.
   *
   * @param  {Dictionary} route
   *         @property {String} verb
   *         @property {String} path
   *         @property {Dictionary} target
   *         @property {Dictionary} options
   *
   * @api private
   */
  return function interpretRouteSyntax (route) {
    var target = route.target;
    var path = route.path;
    var verb = route.verb;
    var options = route.options;


    // Support various dictionary target notations, e.g.:
    // `{ controller: 'UserController' }`
    if (_.isObject(target) && !_.isFunction(target) && !_.isArray(target)) {

      // Merge target into `options` to get hold of relevant route options:
      options = _.merge(options, target);
      // Note: this (^) could be moved up into lib/router/bind.js, since its
      // only pertinent for core options such as `skipAssets`.  There would need
      // to be changes in other hooks as well.

      // Support { controller: 'FooController' } notation (with or without `action`)
      if ( !_.isUndefined(target.controller) ) {
        return bindController(path, target, verb, options);
      }

      // Support resourceful sub-mappings for verbless routes
      // e.g. '/someRoute': { post: 'FooController.bar', get: '...', /* ... */ }
      // If verb was manually specified in route address (e.g. `get /someRoute`), ignore the sub-mappings.
      //
      ////////////////////////////////////////////////////////////////////////////////////
      // Support for this routing syntax will be deprecated in Sails v1.0.
      ////////////////////////////////////////////////////////////////////////////////////
      if ( !options.detectedVerb ) {
        if ( target.get ) { sails.router.bind (path, target['get'],'get', options); }
        if ( target.post ) { sails.router.bind (path, target['post'],'post', options); }
        if ( target.put ) { sails.router.bind (path, target['put'],'put', options); }
        if ( target['delete'] ) { sails.router.bind (path, target['delete'],'delete', options); }
        // If there is a legitimate use case for it, add other HTTP verbs here for completeness.
      }

      // Lone action syntax, e.g.:
      // '/someRoute': { action: 'find', model: 'foo' }
      //
      // (useful for explicitly routing a URL to a blueprint action)
      //
      ////////////////////////////////////////////////////////////////////////////////////
      // Support for this routing syntax will be deprecated in Sails v1.0.
      ////////////////////////////////////////////////////////////////////////////////////
      else if ( !_.isUndefined(target.action) ) {

        // Merge target def. into route options:
        options.action = target.action;

        return bindBlueprintAction(path, target.action, verb, options);
      }
    }


    // Support string ('FooController.bar') notation
    else if (_.isString(target)) {

      // Handle dot notation
      var parsedTarget = target.match(/^([^.]+)\.?([^.]*)?$/);

      // If target matches a controller (or, if views hook enabled, a view)
      // go ahead and assume that this is a dot notation route
      var controllerId = sailsUtil.normalizeControllerId(parsedTarget[1]);
      var actionId = _.isString(parsedTarget[2]) ? parsedTarget[2].toLowerCase() : 'index';

      // If this is a known controller, bind it
      if ( controllerId && (
        sails.middleware.controllers[controllerId] ||
        (sails.config.hooks.views.blueprints && sails.middleware.views[controllerId])
        )
      ) {
        return bindController (path, {
          controller: controllerId,
          action: actionId
        }, verb, options);
      }
    }

    // Ignore unknown route syntax
    // If it needs to be understood by another hook, the hook would have also received
    // the typeUnknown event, so we're done.
    return;
  };



  /**
   * Bind route to a controller/action.
   *
   * @param  {[type]} path   [description]
   * @param  {[type]} target [description]
   * @param  {[type]} verb   [description]
   * @param  {[type]} options[description]
   * @return {[type]}        [description]
   * @api private
   */
  function bindController ( path, target, verb, options ) {

    // Normalize controller and action ids
    var controllerId = sailsUtil.normalizeControllerId(target.controller);
    var actionId = _.isString(target.action) ? target.action.toLowerCase() : null;


    // Look up appropriate controller/action and make sure it exists
    var controller = sails.middleware.controllers[controllerId];

    // Fall back to matching view
    if (!controller) {
      controller = sails.middleware.views[controllerId];
    }

    // If a controller and/or action was specified,
    // but it's not a match, warn the user
    if ( ! ( controller && _.isObject(controller) )) {
      sails.after('lifted', function () {
        sails.log.error(
          'Ignored attempt to bind route (' + path + ') to unknown controller ::',
          controllerId+'.'
        );
      });
      return;
    }
    if ( actionId && !controller[actionId] ) {
      sails.after('lifted', function () {
        sails.log.error(
          'Ignored attempt to bind route (' + path + ') to unknown controller.action ::',
          controllerId + '.' + (actionId || 'index')
        );
      });
      return;
    }

    // (if unspecified, default actionId to 'index'
    actionId = actionId || 'index';

    // Merge the target controller/action into our route options:
    options.controller = controllerId;
    options.action = actionId;


    // Determine the model connected to this controller either by:
    // -> on the routes config
    // -> on the controller
    //
    ////////////////////////////////////////////////////////////////////////////////////
    // Support for specifying `model` on the route target will be deprecated in Sails v1.0.
    // (instead you will be able to override the action directly)
    ////////////////////////////////////////////////////////////////////////////////////
    var modelId = options.model || controllerId;



    // If the orm hook is enabled, it has already been loaded by this time,
    // so just double-check to see if the attached model exists in `sails.models`.
    //
    ////////////////////////////////////////////////////////////////////////////////////
    // In Sails v1.0, this logic will be implemented by the blueprints hook rather than here.
    ////////////////////////////////////////////////////////////////////////////////////
    if (sails.hooks.orm && sails.models && sails.models[modelId]) {

      // If a model with matching identity exists,
      // extend route options with the id of the model.
      options.model = modelId;

      var Model = sails.models[modelId];

      // Mix in the known associations for this model to the route options.
      options = _.merge({ associations: _.cloneDeep(Model.associations) }, options);

      // Mix in the relevant blueprint config
      options = _.defaults(options, {
        populate: sails.config.blueprints.populate,
        defaultLimit: sails.config.blueprints.defaultLimit
      });

    }


    // Now bind the specified action-- our "subTarget"
    var subTarget = controller[actionId];
    //
    // But first, if this is not an array, then wrap it in one (non-destructive)
    if ( !_.isArray(subTarget) ) {
      subTarget = [ subTarget ];
    }
    //
    // Now we have an array of functions, so bind each one to the route address in order.
    _.each(subTarget, function bindEachMiddlewareInSubTarget (fn) {
      sails.router.bind(path, controllerHandler(fn), verb, options);
    });



    // Wrap up the controller middleware to supply access to
    // the original target when requests comes in
    function controllerHandler (originalFn) {

      if ( !_.isFunction(originalFn) ) {
        sails.after('lifted', function () {
          sails.log.error(
            'In '+controllerId + '.' + actionId+', ignored invalid attempt to bind route to a non-function controller:',
            originalFn, 'for path: ', path, verb ? ('and verb: ' + verb) : '');
        });
        return;
      }

      // Bind intercepted middleware function to route
      return originalFn;
    }

    return;
  }


  /**
   * Bind specified blueprint action to the specified route.
   *
   * @param  {[type]} path              [description]
   * @param  {[type]} blueprintActionID [description]
   * @param  {[type]} verb              [description]
   * @param  {[type]} options           [description]
   * @return {[type]}                   [description]
   */
  function bindBlueprintAction (path, blueprintActionID, verb, options){

    // Look up appropriate blueprint action and make sure it exists
    var blueprint = sails.middleware.blueprints[blueprintActionID];

    // If a 'blueprint' was specified, but it doesn't exist, warn the user and ignore it.
    if ( ! ( blueprint && _.isFunction(blueprint) )) {
      sails.after('lifted', function () {
        sails.log.error(
          'Ignored attempt to bind route (' + path + ') to unknown blueprint action (`'+blueprintActionID+'`).'
        );
      });
      return;
    }

    sails.router.bind(path, blueprint, verb, options);
  }

};

