/**
 * Dependencies
 */
var path   = require("path");
var lodash = require("lodash");

/**
 * Exports
 */
module.exports = function(sails) {
  return {

    initialize: function(cb) {
      sails.plugins = {

        list: function(){
          return _pluginList(sails.config.appPath, sails.config.paths.plugins);
        },

        isAvailable: function(pluginName){
          return _isContains(sails.config.appPath, sails.config.paths.plugins, pluginName);
        }
      };

      cb();
    }

  };
};


/**
 * Private
 */
function _pluginList(appPath, pluginsPath){
  var pluginPaths = [];
  for (var i = pluginsPath.length - 1; i >= 0; i--)
    pluginPaths.push((path.basename(pluginsPath[i])));
  // TODO: Deleted when moduleloader are fixed
  // ensure that appPath is not in the array
  return _.pull(pluginPaths, path.basename(appPath));
}

function _isContains(appPath, pluginsPath, pluginName){
  pluginList = _pluginList(appPath, pluginsPath);
  result = _.indexOf(pluginList, pluginName);
  if (result === -1) return false;
  return true;
}


