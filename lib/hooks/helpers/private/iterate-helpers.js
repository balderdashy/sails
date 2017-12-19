/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * iterateHelpers()
 *
 * @private
 * ---------------------------------------------------------------
 * @param  {Dictionary} root
 *         the initial pack, or `sails.helpers`
 *
 * @param  {Function?} onBeforeRecurse(branch,key,depth,isFirst,isLast,lastnessPerAncestor)
 *
 * @param  {Function?} onAfterRecurse(branch,key,depth,isFirst,isLast,lastnessPerAncestor)
 *
 * @param  {Function?} onLeaf(leaf,key,depth,isFirst,isLast,lastnessPerAncestor)
 * ---------------------------------------------------------------
 */
module.exports = function iterateHelpers(initialPackOrRoot, onBeforeRecurse, onAfterRecurse, onLeaf){

  (function $recurse(parentPackOrRoot, lastnessPerAncestor, depth){

    // Build an array of keys, sorted by:
    //  • packs first, then helpers
    //  • alphabetical by key after that
    var keys = _.sortByAll(_.keys(parentPackOrRoot), function(key){
      var branch = parentPackOrRoot[key];
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        //(pack)
        return '________'+key;
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        //(helper)
        return key;
      } else {
        //(mystery meat?)
        return Infinity;
      }
    });

    _.each(keys, function(key, keyIdx){
      var branch = parentPackOrRoot[key];
      var isFirst = keyIdx === 0;
      var isLast = keyIdx === keys.length - 1;

      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        if (onBeforeRecurse) {
          onBeforeRecurse(branch, key, depth + 1, isFirst, isLast, lastnessPerAncestor);
        }
        $recurse(branch, lastnessPerAncestor.concat([isLast]), depth + 1);
        if (onAfterRecurse) {
          onAfterRecurse(branch, key, depth + 1, isFirst, isLast, lastnessPerAncestor);
        }
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        if (onLeaf) {
          onLeaf(branch, key, depth + 1, isFirst, isLast, lastnessPerAncestor);
        }
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

  })(initialPackOrRoot, [], 0);//‰

};//ƒ
