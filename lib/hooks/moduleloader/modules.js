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
   * @param  config sails config
   * @return array of paths
   */
  initialize: function(configAppPath){
    var file_path = configAppPath + '/config/plugins';

    // TODO: Regular expression?
    if(fs.existsSync(file_path + '.js') || fs.existsSync(file_path + '.coffee')){

      var list = _.map(require(file_path).plugins, function(plugin){
        return  configAppPath + '/node_modules/' + plugin;
      });

      var result =  _.filter(list, function(plugin){
        return fs.existsSync(plugin);
      });

      return result;
    }
    return [];
  }
};
