/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');


/**
 * iterateHelpers()
 *
 * @param  {Dictionary} root                     [the initial pack, or `sails.helpers`]
 * @param  {Function} onBeforeRecurse(branch,key,progressFraction)
 * @param  {Function} onAfterRecurse(branch,key,progressFraction)
 * @param  {Function} onLeaf(leaf,key,progressFraction)
 */
module.exports = function iterateHelpers(initialPackOrRoot, onBeforeRecurse, onAfterRecurse, onLeaf){

  (function $recurse(packOrRoot){

    var keys = _.keys(packOrRoot);
    _.each(keys, function(key, keyIdx){
      var branch = packOrRoot[key];
      var progressFraction = (keyIdx+1) / keys.length;

      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        onBeforeRecurse(branch, key, progressFraction);
        $recurse(branch);
        onAfterRecurse(branch, key, progressFraction);
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        onLeaf(branch, key, progressFraction);
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

  })(initialPackOrRoot);//‰

};//ƒ
