module.exports = function(sails) {


  /**
   * Module dependencies
   */

  var _ = require('@sailshq/lodash');
  var mergeDictionaries = require('merge-dictionaries');


  /**
   * Userconfig
   *
   * Load configuration files.
   */
  return {


    // Default configuration
    defaults: {},


    /**
     * Fetch relevant modules, exposing them on `sails` subglobal if necessary,
     */
    loadModules: function (cb) {

      sails.log.silly('Loading app config...');

      // Grab reference to mapped overrides
      // - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: Optimization: do we need this _.clone()?
      // - - - - - - - - - - - - - - - - - - - - - - - - - - -
      var overrides = _.clone(sails.config);


      // If appPath not specified yet, use process.cwd()
      // (the directory where this Sails process is being initiated from)
      if ( ! overrides.appPath ) {
        sails.config.appPath = process.cwd();
      }

      // Load config dictionary from app modules
      sails.modules.loadUserConfig(function loadedAppConfigModules (err, userConfig) {
        if (err) { return cb(err); }

        // Finally, extend user config with overrides
        var config = {};

        // Merge the overrides into the loaded user config.
        config = mergeDictionaries(userConfig, overrides);

        // Ensure final configuration object is valid
        // (in case moduleloader fails miserably)
        config = _.isObject(config) ? config : (sails.config || {});

        // Save final config into sails.config
        sails.config = config;

        cb();
      });
    }
  };
};
