/**
 * Dependencies
 */
var pathHelper = require('./pathHelper');
var Err        = require('../../../errors');


/**
 * Exports
 */
module.exports = function(sails){
  return {
    initialize: function(cb){
      sails.modules = {
        availables   : _availables,
        isAvailable  : _isAvailable,
        size         : _size,
        isEmpty      : _isEmpty,
        errorHandler : _errorHandler,
        shield       : _shield
      };
      cb();
    }
  };
};

/**
 * Private
 */
 function _availables(){
  return pathHelper.list(sails.config.appPath, sails.config.paths.modules);
}

function _isAvailable(moduleName){
  return pathHelper.isAvailable(sails.config.appPath, sails.config.paths.modules, moduleName);
}

function _size(){
  return _availables().length;
}

function _isEmpty(){
  return (_size() > 0) ? false : true;
}

function _errorHandler(moduleName){
  Err.fatal.__ModuleMissing__(moduleName);
  return;
}

function _shield(){
  for (var i = arguments.length - 1; i >= 0; i--)
    if(!_isAvailable(arguments[i])) _errorHandler(arguments[i]);
}
