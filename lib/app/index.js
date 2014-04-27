/**
 * Module dependencies.
 */

var Sails = require('./Sails');

/**
 * Expose `Sails` factory
 * (maintains backwards compatibility w/ constructor usage)
 */

function SailsFactory () {
  return new Sails();
}
module.exports = SailsFactory;


// Backwards compatibility for Sails singleton usage:
var singleton = SailsFactory();
SailsFactory.isLocalSailsValid = singleton.isLocalSailsValid;
SailsFactory.isSailsAppSync = singleton.isSailsAppSync;
