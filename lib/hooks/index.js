/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var async = require('async');
var STRIP_COMMENTS_RX = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;



module.exports = function(sails) {


  /**
   * Expose hook constructor
   *
   * @api private
   */

  return function Hook(definition) {

    // Flags to indicate whether or not this hook's `initialize` function is asynchronous (i.e. declared with `async`)
    // and whether or not it has any parameters.
    var hasAsyncInit;
    var initSeemsToExpectParameters;

    // A few sanity checks to make sure te provided definition does not contain any reserved properties.
    if (!_.isObject(definition)) {
      // This particular behavior can be made a bit less genteel in future versions (it is currently
      // forgiving for backwards compatibility)
      definition = definition || {};
    }

    if (_.isFunction(definition.config)) {
      throw flaverr({ name: 'userError', code: 'E_INVALID_HOOK_CONFIG' }, new Error('Error defining hook: `config` is a reserved property and cannot be used as a custom hook method.'));
    }
    if (_.isFunction(definition.middleware)) {
      throw flaverr({ name: 'userError', code: 'E_INVALID_HOOK_CONFIG' }, new Error('Error defining hook: `middleware` is a reserved property and cannot be used as a custom hook method.'));
    }



    /**
     * Load the hook asynchronously
     *
     * @api private
     */

    this.load = function(cb) {

      var self = this;

      // TODO: refactor this: (no need for an inline function declaration)
      var routeCallbacks = function(routes) {
        _.each(routes, function(middleware, route) {
          middleware._middlewareType = self.identity.toUpperCase() + ' HOOK' + (middleware.name ? (': ' + middleware.name) : '');
          sails.router.bind(route, middleware);
        });
      };//ƒ

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
        if (err) { return cb(err); }

        // console.log(self.identity, self.initialize.toString());
        try {
          var seemsToExpectCallback = true;
          if (sails.config.implementationSniffingTactic === 'analogOrClassical') {
            seemsToExpectCallback = initSeemsToExpectParameters;
            // (TODO: also locate and update relevant error messages)
          }

          if (hasAsyncInit) {
            var promise;
            if (seemsToExpectCallback) {
              promise = self.initialize(cb);
            } else {
              promise = self.initialize(function(unusedErr){
                cb(new Error('Unexpected attempt to invoke callback.  Since this "initialize" function does not appear to expect a callback parameter, this stub callback was provided instead.  Please either explicitly list the callback parameter among the arguments or change this code to no longer use a callback.'));
              })
              .then(function(){
                cb();
              });
            }//ﬁ
            promise.catch(function(e) {
              cb(e);
              // (Note that we don't do `return proceed(e)` here.  That's on purpose--
              // to avoid sending the wrong idea to you, dear reader)
            });
          } else {
            if (seemsToExpectCallback) {
              self.initialize(cb);
            } else {
              self.initialize(function(unusedErr){
                cb(new Error('Unexpected attempt to invoke callback.  Since this "initialize" function does not appear to expect a callback parameter, this stub callback was provided instead.  Please either explicitly list the callback parameter among the arguments or change this code to no longer use a callback.'));
              });
              return cb();
            }
          }
        } catch (e) { return cb(e); }
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
    this.defaults = function() {
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

    // Set a flag if this hook has an async `initialize` function, and
    // whether or not that function seems to be expecting any parameters.
    hasAsyncInit = this.initialize.constructor.name === 'AsyncFunction';
    initSeemsToExpectParameters = (function(fn){
      var fnStr = fn.toString().replace(STRIP_COMMENTS_RX, '');
      var parametersAsString = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')'));
      // console.log('::',parametersAsString, parametersAsString.replace(/\s*/g,'').length);
      return parametersAsString.replace(/\s*/g,'').length !== 0;
    })(this.initialize);//†


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
