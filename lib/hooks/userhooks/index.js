var _ = require('@sailshq/lodash');

module.exports = function(sails) {

  /**
   * `userhooks`
   *
   * Sails hook for loading user plugins (hooks)
   */
  return {

    defaults: { },

    initialize: function(cb) {

      if ( !sails.config.hooks.moduleloader ) {
        return cb('Cannot load user hooks without `moduleloader` hook enabled!');
      }

      sails.log.silly('Loading user hooks...');

      // Load user hook definitions
      sails.modules.loadUserHooks(function hookDefinitionsLoaded(err, hooks) {
        if (err) { return cb(err); }

        // Ensure hooks is valid
        hooks = _.isObject(hooks) ? hooks : {};

        // Add the user hooks to the list of hooks to load
        _.extend(sails.hooks, hooks);

        return cb();

      });
    }
  };
};
