/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');



// NOTE:
// Since controllers load blueprint actions by default anyways, this route syntax handler
// can be replaced with `{action: 'find'}, {action: 'create'}, ...` etc.


/**
 * Expose route parser.
 * @type {Function}
 */
module.exports = function(sails) {

  /**
   * interpretRouteSyntax
   *
   * "Teach" router to understand direct references to blueprints
   * as a target to sails.router.bind()
   * (i.e. in the `routes.js` file)
   *
   * @param  {[type]} route [description]
   * @return {[type]}       [description]
   * @api private
   */
  return function interpretRouteSyntax(route) {
    var target = route.target,
      path = route.path,
      verb = route.verb,
      options = route.options;

    // Support referencing blueprints in explicit routes
    // (`{ blueprint: 'create' }` et. al.)
    if (
      _.isObject(target) &&
      !_.isFunction(target) &&
      !_.isArray(target) &&
      _.isString(target.blueprint)) {

      // On a match, merge leftover items in the target object into route options:
      options = _.merge(options, _.omit(target, 'blueprint'));
      // Note: this (^) could be moved up into lib/router/bind.js, since its
      // only pertinent for core options such as `skipAssets`.  There would need
      // to be changes in other hooks as well.

      return bindBlueprintAction(path, target.blueprint, verb, options);
    }

    // Ignore unknown route syntax
    // If it needs to be understood by another hook, the hook would have also received
    // the typeUnknown event, so we're done.
    return;
  };



  /**
   * Bind explicit route to a blueprint action.
   *
   * @param  {[type]} path   [description]
   * @param  {[type]} blueprintActionID [description]
   * @param  {[type]} verb   [description]
   * @param  {[type]} options   [description]
   * @return {[type]}        [description]
   * @api private
   */
  function bindBlueprintAction(path, blueprintActionID, verb, options) {

    // Look up appropriate blueprint action and make sure it exists
    var blueprint = sails.middleware.blueprints[blueprintActionID];

    // If a 'blueprint' was specified, but it doesn't exist, warn the user and ignore it.
    if (!(blueprint && _.isFunction(blueprint))) {
      sails.log.error(
        blueprintActionID,
        ':: Ignoring attempt to bind route (' + path + ') to unknown blueprint action (`' + blueprintActionID + '`).'
      );
      return;
    }

    // If a model wasn't provided with the options, try and guess it
    if (!options.model) {
      var matches = path.match(/^\/(\w+).*$/);
      if (matches && matches[1] && sails.models[matches[1]]) {
        options.model = matches[1];
      } else {
        sails.log.error(
          blueprintActionID,
          ':: Ignoring attempt to bind route (' + path + ') to blueprint action (`' + blueprintActionID + '`), but no valid model was specified and we couldn\'t guess one based on the path.'
        );
        return;
      }
    }

    // If associations weren't provided with the options, try and get them
    if (!options.associations) {
      options = _.merge({
        associations: _.cloneDeep(sails.models[options.model].associations)
      }, options);
    }
    // Otherwise make sure it's an array of strings of valid association aliases
    else {
      options.associations = options.associations.map(function(alias) {
        if (!_.isString(alias)) {
          sails.log.error(
            blueprintActionID,
            ':: Ignoring invalid association option for ' + path + '.'
          );
          return;
        }
        var association;
        if (!(association = _.findWhere(sails.models[options.model].associations, {
            alias: alias
          }))) {
          sails.log.error(
            blueprintActionID,
            ':: Ignoring invalid association option `' + alias + '` for ' + path + '.'
          );
          return;
        }
        return association;
      });
    }

    // If "populate" wasn't provided in the options, use the default
    if (_.isUndefined(options.populate)) {
      options.populate = sails.config.blueprints.populate;
    }

    sails.router.bind(path, blueprint, verb, options);

    return;
  }

};
