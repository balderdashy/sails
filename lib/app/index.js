/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var Sails = require('./Sails');


/**
 * Expose `Sails` factory...thing.
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



