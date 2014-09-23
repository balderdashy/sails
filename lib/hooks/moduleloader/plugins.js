/**
 * Dependencies
 */
 var fs = require('fs');
 var _  = require('lodash');


/**
 * Exports
 */
module.exports = {

  /**
   * check paths and return an array of plugins available for
   * register in the core
   * @param  {[type]} config sails config
   * @return {[type]}        array of paths
   */
  initialize: function(config){
    var file_path = config.appPath + '/config/plugins';

    // TODO: Regular expression?
    if(fs.existsSync(file_path + '.js') || fs.existsSync(file_path + '.coffee')){

      var list = _.map(require(file_path).plugins, function(plugin){
        return  config.appPath + '/node_modules/' + plugin;
      });

      var result =  _.filter(list, function(plugin){
        return fs.existsSync(plugin);
      });

      return result;
    }
    return [];
  }
};
