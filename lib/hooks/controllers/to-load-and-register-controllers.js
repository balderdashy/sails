/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var sailsUtil = require('sails-util');


/**
 * @param  {SailsApp} sails  [Sails app]
 * @param  {Hook} hook       [instantiated hook]
 * @return {Function}
 */
module.exports = function to(sails, hook) {

  /**
   * `loadAndRegisterControllers()`
   *
   * Wipe everything and (re)load middleware from controllers. Merge any
   * controllers already defined in the sails.controllers namespace.
   *
   * @api private
   */
  return function loadAndRegisterControllers (cb) {

    // Remove all controllers from middleware hash,
    // but retain the reference between this and sails.middleware.controllers
    _.each(_.keys(hook.middleware), function(key) {
      delete hook.middleware[key];
    });

    // Load app controllers
    sails.modules.loadControllers(function modulesLoaded(err, modules) {
      if (err) return cb(err);

      sails.controllers = _.merge(sails.controllers, modules);

      // Register controllers
      _.each(sails.controllers, function(controller, controllerId) {

        // Override whatever was here before
        if (!sailsUtil.isDictionary(hook.middleware[controllerId])) {
          hook.middleware[controllerId] = {};
        }

        // Register this controller's actions
        _.each(controller, function(action, actionId) {

          // action ids are case insensitive
          actionId = actionId.toLowerCase();

          // If the action is set to `false`, explicitly disable it
          if (action === false) {
            delete hook.middleware[controllerId][actionId];
            return;
          }

          // Ignore non-actions (special properties)
          //
          // Properties like these are injected by `moduleloader`
          // Ideally they should be hidden in the prototype or omitted instead
          // of this blanket approach.  This approach has worked for a long time,
          // but should not be relied upon- even within core (since a change is likely
          // in Sails v1.0)
          if (_.isString(action) || _.isBoolean(action)) {
            return;
          }

          // Otherwise mix it in (this will override CRUD blueprints from above)
          action._middlewareType = 'ACTION: ' + controllerId + '/' + actionId;
          hook.middleware[controllerId][actionId] = action;
          hook.explicitActions[controllerId] = hook.explicitActions[controllerId] || {};
          hook.explicitActions[controllerId][actionId] = true;
        });

      });

      return cb();
    });
  };

};

