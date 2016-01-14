/**
 * Module dependencies
 */

var Sails = require('./app');



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
