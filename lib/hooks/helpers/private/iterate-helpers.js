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
 * @param  {Function} onBeforeRecurse(branch,key,depth,isFirst,isLast,parent)
 *
 * @param  {Function} onAfterRecurse(branch,key,depth,isFirst,isLast,parent)
 *
 * @param  {Function} onLeaf(leaf,key,depth,isFirst,isLast,parent,grandparent)
 *
 * ---------------------------------------------------------------
 */
module.exports = function iterateHelpers(initialPackOrRoot, onBeforeRecurse, onAfterRecurse, onLeaf){

  (function $recurse(parentPackOrRoot, grandparentPackMaybe, depth){

    var keys = _.keys(parentPackOrRoot);
    _.each(keys, function(key, keyIdx){
      var branch = parentPackOrRoot[key];
      var isFirst = keyIdx === 0;
      var isLast = keyIdx === keys.length - 1;

      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        onBeforeRecurse(branch, key, depth + 1, isFirst, isLast, parentPackOrRoot);
        $recurse(branch, parentPackOrRoot, depth + 1);
        onAfterRecurse(branch, key, depth + 1, isFirst, isLast, parentPackOrRoot);
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        onLeaf(branch, key, depth + 1, isFirst, isLast, parentPackOrRoot, grandparentPackMaybe);
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

  })(initialPackOrRoot, undefined, 0);//‰

};//ƒ
