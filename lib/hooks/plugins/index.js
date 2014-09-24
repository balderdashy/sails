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
          all: function(){
            return pathHelper.list(sails.config.appPath, sails.config.paths.plugins);
          },
          isAvailable: function(pluginName){
            return pathHelper.isAvailable(sails.config.appPath, sails.config.paths.plugins, pluginName);
          },
          size: function(){
            return pathHelper.list(sails.config.appPath, sails.config.paths.plugins).length;
          },
          isEmpty: function(){
            result = pathHelper.list(sails.config.appPath, sails.config.paths.plugins).length;
            return (result > 0) ? false : true;
          }
        };
      cb();
    }

  };
};
