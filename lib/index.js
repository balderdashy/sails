/**
 * Module dependencies
 */

var Sails = require('./app');


// Instantiate and expose a Sails singleton
// (maintains legacy support)
module.exports = new Sails();

// expose it so it can be easily required
module.exports.SailsCommands = require('../bin/sails').Commands;

// Expose constructor as `.Sails` for convenience/tests:
// =========================================================
// To access the Sails app constructor, do:
// var Sails = require('sails').constructor;
// or:
// var Sails = require('sails').Sails;
//
// Then:
// var newApp = new Sails();
// =========================================================
module.exports.Sails = Sails;
