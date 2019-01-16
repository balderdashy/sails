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

        // If `sails.config.loadHooks` is set, then only include user hooks if
        // they are explicitly listed therein.
        // > Note that `sails.config.hooks` is taken care of as part of the
        // > implementation of `sails.modules.loadUserHooks()`.
        if (sails.config.loadHooks) {
          sails.log.silly('Since `sails.config.userHooks` was specified, checking user hooks against it to make sure they should actually be loaded...');
          _.each(hooks, function(def, hookName) {
            if (!_.contains(sails.config.loadHooks, hookName)) {
              delete hooks[hookName];
              sails.log.verbose('Skipped loading "'+hookName+'" hook, because `sails.config.loadHooks` was specified but did not explicitly include this hook\'s name.');
            }
          });
        }//ﬁ

        // Add the user hooks to the list of hooks to load
        // (excluding any that were omitted)
        _.extend(sails.hooks, hooks);

        return cb();

      });
    }
  };
};
