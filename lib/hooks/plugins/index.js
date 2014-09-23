/**
 * Dependencies
 */
var pathHelper = require('./pathHelper');

/**
 * Exports
 */
module.exports = function(sails) {
  return {

    initialize: function(cb) {
      sails.plugins = {

        list: function(){
          return pathHelper.list(sails.config.appPath, sails.config.paths.plugins);
        },

        isAvailable: function(pluginName){
          return pathHelper.isAvailable(sails.config.appPath, sails.config.paths.plugins, pluginName);
        }
      };

      cb();
    }

  };
};
