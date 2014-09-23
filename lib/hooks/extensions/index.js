/**
 * Dependencies
 */
var pathHelper = require("../plugins/pathHelper");

/**
 * Exports
 */
module.exports = function(sails) {
  return {

    initialize: function(cb) {
      sails.extensions = {

        list: function(){
          return pathHelper.list(sails.config.appPath, sails.config.paths.extensions);
        },

        isAvailable: function(pluginName){
          return pathHelper.isAvailable(sails.config.appPath, sails.config.paths.extensions, pluginName);
        }
      };

      cb();
    }

  };
};
