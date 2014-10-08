/**
 * Module dependencies.
 */

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var DEFAULT_HOOKS = require('./defaultHooks');

module.exports = function(sails) {

  /**
   * Expose new instance of `Configuration`
   */

  return new Configuration();


  function Configuration() {


    /**
     * Sails default configuration
     *
     * @api private
     */
    this.defaults = function defaultConfig(appPath) {

      var defaultEnv;
      // If we're not loading the userconfig hook, which normally takes care
      // of ensuring that we have an environment, then make sure we set one here.
      // TODO: Is this the best way of checking that userconfig is off?
      if (sails.config.hooks && sails.config.hooks.userconfig === false ||
         (sails.config.loadHooks && sails.config.loadHooks.indexOf('userconfig') == -1)
      ) {
        defaultEnv = sails.config.environment || "development";
      }

      // If `appPath` not specified, unfortunately, this is a fatal error,
      // since reasonable defaults cannot be assumed
      if (!appPath) {
        throw new Error('No `appPath` specified!');
      }

      // Set up config defaults
      return {

        environment: defaultEnv,

        // Default hooks
        // TODO: remove hooks from config to avoid confusion
        // (because you can't configure hooks in `userconfig`-- only in `overrides`)
        hooks: _.reduce(DEFAULT_HOOKS, function (memo, hookName) {
          memo[hookName] = require('../../hooks/'+hookName);
          return memo;
        }, {}) || {},

        // Save appPath in implicit defaults
        // appPath is passed from above in case `sails lift` was used
        // This is the directory where this Sails process is being initiated from.
        // (  usually this means `process.cwd()`  )
        appPath: appPath,

        // Built-in path defaults
        paths: {
          tmp: path.resolve(appPath, '.tmp')
        },

        // Start off `routes` and `middleware` as empty objects
        routes: {},
        middleware: {}

      };
    },



    /**
     * Load the configuration modules
     *
     * @api private
     */

    this.load = require('./load')(sails);



    // Bind the context of all instance methods
    _.bindAll(this);

  }

};
