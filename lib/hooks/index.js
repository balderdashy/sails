/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var async = require('async');




module.exports = function(sails) {


  /**
   * Expose hook constructor
   *
   * @api private
   */

  return function Hook(definition) {

    // A few sanity checks to make sure te provided definition does not contain any reserved properties.
    if (!_.isObject(definition)) {
      // This particular behavior can be made a bit less genteel in future versions (it is currently
      // forgiving for backwards compatibility)
      definition = definition || {};
    }
    
    if (_.isFunction(definition.config)) {
      throw new Error('Error defining hook: `config` is a reserved property and cannot be used as a custom hook method.');
    }
    if (_.isFunction(definition.middleware)) {
      throw new Error('Error defining hook: `middleware` is a reserved property and cannot be used as a custom hook method.');
    }
    


    /**
     * Load the hook asynchronously
     *
     * @api private
     */

    this.load = function(cb) {

      var self = this;

      var routeCallbacks = function(routes) {
        _.each(routes, function(middleware, route) {
          middleware._middlewareType = self.identity.toUpperCase() + ' HOOK' + (middleware.name ? (': ' + middleware.name) : '');
          sails.router.bind(route, middleware);
        });
      };

      // Determine if this hook should load based on Sails environment & hook config
      if (this.config.envs &&
        this.config.envs.length > 0 &&
        this.config.envs.indexOf(sails.config.environment) === -1) {
        return cb();
      }

      // Convenience config to bind routes before any of the static app routes
      sails.on('router:before', function() {
        routeCallbacks(self.routes.before);
      });

      // Convenience config to bind routes after the static app routes
      sails.on('router:after', function() {
        routeCallbacks(self.routes.after);
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
        try {
          self.initialize(cb);
        } catch(e) {
          return cb(e);
        }
      });

    };



    /**
     * `defaults`
     *
     * Default configuration for this hook.
     *
     * Hooks may override this function, or use a dictionary instead.
     *
     * @type {Function|Dictionary}
     *       @returns {Dictionary} [default configuration for this hook to be merged into sails.config]
     */
    this.defaults = function(config) {
      return {};
    };

    /**
     * `configure`
     *
     * If this hook provides this function, the provided implementation should
     * normalize and validate configuration related to this hook.  That config is
     * already in `sails.config` at the time this function is called.  Any modifications
     * should be made in place on `sails.config`
     *
     * Hooks may override this function.
     *
     * @type {Function}
     */
    this.configure = function() {

    };

    /**
     * `loadModules`
     *
     * Load any modules as a dictionary and pass the loaded modules to the callback when finished.
     *
     * Hooks may override this function (This runs before `initialize()`!)
     *
     * @type {Function}
     * @async
     */
    this.loadModules = function(cb) {
      return cb();
    };


    /**
     * `initialize`
     *
     * If provided, this implementation should prepare the hook, then trigger the callback.
     *
     * Hooks may override this function.
     *
     * @type {Function}
     * @async
     */
    this.initialize = function(cb) {
      return cb();
    };



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
     * Ensure that a hook definition has the required properties.
     * 
     * @returns {Dictionary} [coerced hook definition]
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
  };

};
