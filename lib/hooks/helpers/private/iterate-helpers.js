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

  var emissions = [];

  (function $recurse(parentPackOrRoot, grandparentPackMaybe, depth){

    var keys = _.keys(parentPackOrRoot);
    _.each(keys, function(key, keyIdx){
      var branch = parentPackOrRoot[key];
      var isFirst = keyIdx === 0;
      var isLast = keyIdx === keys.length - 1;

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // TODO: sort packs first, helpers last (and then alphabetically after that)
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // TODO: instead of "parent pack" and "grandparent pack", provide ancestral
      // "lastness" information
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      var branchInfo = {
        branch: branch,
        key: key,
        depth: depth + 1,
        isFirst: isFirst,
        isLast: isLast,
        parent: parentPackOrRoot,
      };

      // Duck-type this branch and handle it accordingly.
      if (!_.isFunction(branch) && branch.toJSON && branch.toJSON().defs) {
        // (pack)
        emissions.push(_.extend({
          emissionType: 'onBeforeRecurse'
        }, branchInfo));
        $recurse(branch, parentPackOrRoot, depth + 1);
        emissions.push(_.extend({
          emissionType: 'onAfterRecurse'
        }, branchInfo));
      } else if (_.isFunction(branch) && branch.toJSON && branch.toJSON().identity) {
        // (helper)
        emissions.push(_.extend({
          emissionType: 'onLeaf'
        }, branchInfo));
      } else {
        // (mystery meat?)
        // ignore it.
      }
    });//∞

  })(initialPackOrRoot, undefined, 0);//‰

  _.each(emissions, function(itn){
    if (itn.emissionType === 'onBeforeRecurse') {
      onBeforeRecurse(itn.branch, itn.key, itn.depth + 1, itn.isFirst, itn.isLast, parentPackOrRoot);
    } else if (itn.emissionType === '')
      onAfterRecurse(itn.branch, itn.key, itn.depth + 1, itn.isFirst, itn.isLast, parentPackOrRoot);
    } else if (itn.emissionType === 'helper') {
      onLeaf(itn.branch, itn.key, itn.depth + 1, itn.isFirst, itn.isLast, parentPackOrRoot, grandparentPackMaybe);
    } else { throw new Error('Consistency violation: Should never have made it here!'); }
  });//∞

};//ƒ
