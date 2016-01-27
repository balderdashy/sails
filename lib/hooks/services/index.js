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
      // This initial setup of `sails.services` was included here as an experimental
      // feature so that these modules would be accessible for other hooks.  This will be
      // deprecated in Sails v1.0 in favor of (likely) the ability for hook authors to register
      // or unregister services programatically.  In addition, services will no longer be exposed
      // on the `sails` app instance.
      //
      // Expose an empty dictionary for `sails.services` so that it is
      // guaranteed to exist.
      sails.services = {};
    },


    loadModules: function(cb) {

      // In future versions of Sails, the empty registry of services can be loaded here:
      // sails.services = {};

      sails.log.verbose('Loading app services...');

      // Load service modules using the module loader
      // (by default, this loads services from files in `api/services/*`)
      sails.modules.loadServices(function(err, modules) {
        if (err) {
          sails.log.error('Error occurred loading modules ::');
          sails.log.error(err);
          return cb(err);
        }

        // Expose services on `sails.services` to provide access even when globals are disabled.
        _.extend(sails.services, modules);

        // Expose globals (if enabled)
        if (sails.config.globals.services) {
          _.each(sails.services, function(service, identity) {
            var globalId = service.globalId || service.identity || identity;
            global[globalId] = service;
          });
        }

        // Relevant modules have finished loading.
        return cb();
      });
    }// </loadModules>
  };//</hook definition>
};
