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
        sails.modules = {
          all: function(){
            return pathHelper.list(sails.config.appPath, sails.config.paths.modules);
          },
          isAvailable: function(pluginName){
            return pathHelper.isAvailable(sails.config.appPath, sails.config.paths.modules, pluginName);
          },
          size: function(){
            return pathHelper.list(sails.config.appPath, sails.config.paths.modules).length;
          },
          isEmpty: function(){
            result = pathHelper.list(sails.config.appPath, sails.config.paths.modules).length;
            return (result > 0) ? false : true;
          }
        };
      cb();
    }

  };
};
