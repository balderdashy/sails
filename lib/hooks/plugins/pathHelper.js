/**
 * Dependencies
 */
var path   = require("path");
var _      = require("lodash");

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

/**
 * Exports
 */
module.exports = {
  list        : _list,
  isAvailable : _isAvailable
};
