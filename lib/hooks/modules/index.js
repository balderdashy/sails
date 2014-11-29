/**
 * Dependencies
 */
var path = require("path");
var _    = require("lodash");
var Err  = require('../../../errors');



/**
 * Exports
 */
module.exports = function(sails){
  return {
    initialize: function(cb){
      sails.modules = {
        availables: function(){
          return _list(sails.config.appPath, sails.config.paths.modules);
        },
        isAvailable: function(moduleName){
          return _isAvailable(sails.config.appPath, sails.config.paths.modules, moduleName);
        },
        size: function(){
          return _size(sails.config.appPath, sails.config.paths.modules);
        },
        isEmpty: function(){
          return (_size(sails.config.appPath, sails.config.paths.modules) > 0) ? false : true;
        },
        errorHandler: function(moduleName){
          Err.fatal.__ModuleMissing__(moduleName);
          return;
        },
        shield: function(){
          _.forEach(arguments, function(moduleName){
            if(!_isAvailable(sails.config.appPath, sails.config.paths.modules, moduleName)) {
              Err.fatal.__ModuleMissing__(moduleName);
              return;
            }
          });
        }
      };
      cb();
    }
  };
};

 /**
  * Private
  */
  function _list(appPath, arrayPath){
    var list = [];
    for (var i = arrayPath.length - 1; i >= 0; i--)
      list.push((path.basename(arrayPath[i])));
    // TODO: Deleted when moduleloader are fixed
    // ensure that appPath is not in the array
    return _.pull(list, path.basename(appPath));
  }

  function _isAvailable(appPath, arrayPath, item){
    list = _list(appPath, arrayPath);
    result = _.indexOf(list, item);
    if (result === -1) return false;
    return true;
  }

  function _size(appPath, arrayPath){
    return _list(appPath, arrayPath).length;
  }
