/**
 * Module dependencies.
 */

// try {console.time('require_core');}catch(e){}
var Sails = require('./Sails');
var _ = require('@sailshq/lodash');


/**
 * Expose `Sails` factory
 * (maintains backwards compatibility w/ constructor usage)
 */

module.exports = SailsFactory;

function SailsFactory() {
  return new Sails();
}


// Backwards compatibility for Sails singleton usage:
var singleton = SailsFactory();
SailsFactory.isLocalSailsValid = _.bind(singleton.isLocalSailsValid, singleton);
SailsFactory.isSailsAppSync = _.bind(singleton.isSailsAppSync, singleton);
