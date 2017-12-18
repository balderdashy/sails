/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * iterateHelpers()
 *
 * ---------------------------------------------------------------
 * @param  {Dictionary} root
 *         the initial pack, or `sails.helpers`
 *
 * @param  {Function} onBeforeRecurse(branch,key,keys,keyIdx)
 *
 * @param  {Function} onAfterRecurse(branch,key,keys,keyIdx)
 *
 * @param  {Function} onLeaf(leaf,key,keys,keyIdx)
 *
 * ---------------------------------------------------------------
 */
module.exports = function iterateHelpers(initialPackOrRoot, onBeforeRecurse, onAfterRecurse, onLeaf){

  (function $recurse(packOrRoot){

    var keys = _.keys(packOrRoot);
    _.each(keys, function(key, keyIdx){
      var branch = packOrRoot[key];

      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        onBeforeRecurse(branch, key, keys, keyIdx);
        $recurse(branch);
        onAfterRecurse(branch, key, keys, keyIdx);
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        onLeaf(branch, key, keys, keyIdx);
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

  })(initialPackOrRoot);//‰

};//ƒ
