/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



module.exports = function iterateHelpers(baseValue, handleBeforeRecurse, handleAfterRecurse, handleLeaf, sails){

  return (function $recurse(packOrRoot){
    packOrRoot = packOrRoot || sails.helpers;

    var result = baseValue;

    _.each(packOrRoot, function(branch, key){
      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        result = handleBeforeRecurse(result, branch, key);
        var subResult = $recurse(branch);
        result = handleAfterRecurse(result, subResult);
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        result = handleLeaf(result, branch, key);
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

    return result;
  })();//‰

};
