/**
 * Module dependencies
 */

var _ = require('lodash');



/**
 * @param  {SailsApp} sails
 * @return {Function}
 */
module.exports = function (sails) {

  /**
   * `services`
   *
   * The definition of `services`, a core hook.
   *
   * @param  {SailsApp} sails
   * @return {Dictionary}
   */
  return {

    // Default configuration
    defaults: {
      globals: {
        services: true
      }
    },

    configure: function() {
      // Expose an empty dictionary for `sails.services` so that it is
      // guaranteed to exist.
      // (Note: this could probably be moved from `configure()` to `initialize()`)
      sails.services = {};
    },

    loadModules: function(cb) {
      sails.log.verbose('Loading app services...');
      // Load service modules using the module loader
      // (by default, this loads services from files in `api/services/*`)
      sails.modules.loadServices(function(err, modules) {
        if (err) {
          sails.log.error('Error occurred loading modules ::');
          sails.log.error(err);
          return cb(err);
        }

        // Expose services on `sails.services` in case globals are disabled.
        _.merge(sails.services, modules);

        // Expose globals (if enabled)
        if (sails.config.globals.services) {
          _.each(sails.services, function(service, identity) {
            var globalName = service.globalId || service.identity || identity;
            global[globalName] = service;
          });
        }

        // Relevant modules have finished loading.
        return cb();
      });
    }// </loadModules>
  };//</hook definition>
};
