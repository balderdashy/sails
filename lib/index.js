/**
 * Module dependencies
 */

var Sails = require('./app');
// * * See also the require for `sails-generate` below. * *


// Instantiate and expose a Sails singleton
// (maintains legacy support)
module.exports = new Sails();

// Expose constructor for convenience/tests
module.exports.Sails = Sails;


// To access the Sails app constructor, do:
// var Sails = require('sails').constructor;
// or:
// var Sails = require('sails').Sails;
//
// Then:
// var newApp = new Sails();




/**
 * Sails.generate()
 *
 * Generate files or folders.
 *
 * >This is an exposed version of sails-generate for programmatic use.
 * > (available on `require('sails').Sails.generate()`)
 *
 * @param {Dictionary} scope
 * @param {Function} cb
 */
module.exports.Sails.generate = function (){

  // Wait until this function is actually called to do this require.
  // (no reason to slow down production lifts)
  var sailsgen = require('sails-generate');

  return sailsgen.apply(this, Array.prototype.slice.call(arguments));

};
