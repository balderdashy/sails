/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



/**
 * furnishHelpers()
 *
 * Provide helpers or packs (i.e. categories) of helpers for use in this
 * Sails app.  (If existing helpers exist, those will take precedence!)
 *
 *
 * @param  {Dictionary} packsBySlugOrTopLvlHelpersByIdentity
 *         Either a dictionary of packs keyed by slug or a dictionary
 *         of helpers keyed by identity.  (Determined by checking for
 *         a `defs` sub-key in any of the top-level child dictionaries.)
 *
 * @experimental  (could change)
 */

module.exports = function furnishHelpers(packsBySlugOrTopLvlHelpersByIdentity){
  if (_.isArray(packsBySlugOrTopLvlHelpersByIdentity) || _.isFunction(packsBySlugOrTopLvlHelpersByIdentity) || !_.isObject(packsBySlugOrTopLvlHelpersByIdentity)) {
    throw new Error('furnishHelpers() expects a dictionary, but instead got: '+packsBySlugOrTopLvlHelpersByIdentity);
  }

  // Determine what kind of usage we're dealing with, then react accordingly.
  var isPacksBySlug = _.any(packsBySlugOrTopLvlHelpersByIdentity, function(childDict){
    return _.isObject(childDict) && childDict.defs;
  });

  if (isPacksBySlug){
    Machine.library(packsBySlugOrTopLvlHelpersByIdentity);
    // TODO

  } else {

    // TODO
  }
};


// for (let slug in dryPacksBySlug) {
//   let dryPack = dryPacksBySlug[slug];

//   if (!sails.helpers[slug]) {
//     sails.registerHelpers({
//       [slug]: dryPack
//     });
//     continue;
//   }//•

//   for (let identity in dryPack.defs) {
//     let def = dryPack.defs[identity];
//     if (sails.helpers[slug][identity]) {
//       // (A helper by this name is already defined in
//       // this Sails app, so just skip this one so that
//       // the helper in userland continues to take precedence.)
//       continue;
//     }//•

//     sails.registerHelpers({
//       [slug]: {
//         [identity]: def
//       }
//     });

//   }//∞
// }//∞
