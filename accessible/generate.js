/**
 * Module dependencies
 */

var sailsgen = require('sails-generate');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// TODO: Remove this at next opportunity to simplify maintenance.
// (Check docs, but I don't think it's documented, and it's not being used
// anywhere anymore.  Now that NPM is faster than it used to be, there's no
// reason to work towards separating the core generators from the main
// framework's NPM package anymore.  So this doesn't really need to exist,
// unless there are a lot of really good use cases for why generators need to be
// easily expoed for programmatic usage.  If you have such a use case, let us
// know at https://sailsjs.com/bugs)
//
// But note that this is a breaking change.
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


/**
 * require('sails/accessible/generate')
 *
 * Generate files or folders.
 *
 * > This is an exposed version of sails-generate for programmatic use.
 * > (available on `require('sails').Sails.generate()`)
 *
 * @param {Dictionary} scope
 * @param {Function|Dictionary} cbOrHandlers
 */
module.exports = function generate (){

  return sailsgen.apply(this, Array.prototype.slice.call(arguments));

};

