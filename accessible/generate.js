/**
 * Module dependencies
 */

var sailsgen = require('sails-generate');


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

