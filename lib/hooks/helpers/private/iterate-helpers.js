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
 * @param  {Function} onBeforeRecurse(branch,key,isFirst,isLast,keys)
 *
 * @param  {Function} onAfterRecurse(branch,key,isFirst,isLast,keys)
 *
 * @param  {Function} onLeaf(leaf,key,isFirst,isLast,keys)
 *
 * ---------------------------------------------------------------
 */
module.exports = function iterateHelpers(initialPackOrRoot, onBeforeRecurse, onAfterRecurse, onLeaf){

  (function $recurse(packOrRoot){

    var keys = _.keys(packOrRoot);
    _.each(keys, function(key, keyIdx){
      var branch = packOrRoot[key];
      var isFirst = keyIdx === 0;
      var isLast = keyIdx === keys.length - 1;

      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        onBeforeRecurse(branch, key, isFirst, isLast, keys);
        $recurse(branch);
        onAfterRecurse(branch, key, isFirst, isLast, keys);
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        onLeaf(branch, key, isFirst, isLast, keys);
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

  })(initialPackOrRoot);//‰

};//ƒ
