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
   * check paths and return an array of modules available for
   * register in the core
   * @param  config sails config
   * @return array of paths
   */
  initialize: function(configAppPath){
    var file_path = configAppPath + '/config/modules';

    // TODO: Regular expression?
    if(fs.existsSync(file_path + '.js') || fs.existsSync(file_path + '.coffee')){

      var list = _.map(require(file_path).modules, function(module){
        return  configAppPath + '/node_modules/' + module;
      });

      var result =  _.filter(list, function(module){
        return fs.existsSync(module);
      });

      return result;
    }
    return [];
  }
};
