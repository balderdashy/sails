/**
 * Module dependencies.
 */

var _ = require('lodash');
var defaultsDeep = require('merge-defaults');
var async = require('async');




module.exports = function(sails) {


  /**
   * Expose hook constructor
   *
   * @api private
   */

  return Hook;


  function Hook(definition) {



    /**
     * Load the hook asynchronously
     *
     * @api private
     */

    this.load = function(cb) {

      var self = this;

      // Determine if this hook should load based on Sails environment & hook config
      if (this.config.envs &&
        this.config.envs.length > 0 &&
        this.config.envs.indexOf(sails.config.environment) === -1) {
        return cb();
      }

      // Convenience config to bind routes before any of the static app routes
      sails.on('router:before', function() {
        _.each(self.routes.before, function(middleware, route) {
          middleware._middlewareType = self.identity.toUpperCase() + ' HOOK' + (middleware.name ? (': ' + middleware.name) : '');
          sails.router.bind(route, middleware);
        });
      });

      // Convenience config to bind routes after the static app routes
      sails.on('router:after', function() {
        _.each(self.routes.after, function(middleware, route) {
          middleware._middlewareType = self.identity.toUpperCase() + ' HOOK' + (middleware.name ? (': ' + middleware.name) : '');
          sails.router.bind(route, middleware);
        });
      });

      // Run loadModules method if moduleloader is loaded
      async.auto({

        modules: function(cb) {

            if (sails.config.hooks.moduleloader) {

              return self.loadModules(cb);

            }
            return cb();
          }
      }, function(err) {
        if (err) return cb(err);
        self.initialize(cb);
      });

    };



    /**
     * Default configuration for this hook
     * (should be overiden by hook definition)
     *
     * @returns {}
     */
    this.defaults = function(config) {
      return {};
    };

    /**
     * `configure`
     *
     * Normalize and validate configuration for this hook.
     * Then fold modifications back into `sails.config`
     *
     * Hooks may override this function.
     */
    this.configure = function() {
      return;
    };

    /**
     * Hooks should override this function
     */
    this.loadModules = function(cb) {
      return cb();
    };

    /**
     * Hooks may override this function
     */
    this.initialize = function(cb) {
      return cb();
    };



    /////// TODO: most of the following could be replaced by taking advantage of lodash "merge"

    // Ensure that the hook definition has valid properties
    _normalize(this);
    definition = _normalize(definition);

    // Merge default definition with overrides in the definition passed in
    _.extend(definition.config, this.config, definition.config);
    _.extend(definition.middleware, this.middleware, definition.middleware);
    _.extend(definition.routes.before, this.routes.before, definition.routes.before);
    _.extend(definition.routes.after, this.routes.after, definition.routes.after);
    _.extend(this, definition);

    // Bind context of new methods from definition
    _.bindAll(this);



    /**
     * Ensure that a hook definition has the required properties
     * @api private
     */

    function _normalize(def) {

      def = def || {};

      // Default hook config
      def.config = def.config || {};

      // list of environments to run in, if empty defaults to all
      def.config.envs = def.config.envs || [];

      def.middleware = def.middleware || {};

      // Default hook routes
      def.routes = def.routes || {};
      def.routes.before = def.routes.before || {};
      def.routes.after = def.routes.after || {};

      return def;
    }
  }

};
