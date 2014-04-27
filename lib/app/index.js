/**
 * Module dependencies.
 */

var events = require('events');
var _ = require('lodash');
var util = require('util');
var loadSails = require('./load');
var mixinAfter = require('./after');
require('colors');



/**
 * Construct a Sails (app) instance.

 * @constructor
 */

function Sails() {

  // Inherit methods from EventEmitter
  events.EventEmitter.call(this);

  // Remove memory-leak warning about max listeners
  // See: http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
  this.setMaxListeners(0);

  // Keep track of spawned child processes
  this.childProcesses = [];

  // Mixin `load()` method to load the pieces
  // of a Sails app
  this.load = loadSails(this);

  // Mixin support for `Sails.prototype.after()`
  mixinAfter(this);

  // Bind `this` context for all `Sails.prototype.*` methods
  _.bindAll(this);
}


// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Sails, events.EventEmitter);



// Public methods
////////////////////////////////////////////////////////

Sails.prototype.lift = require('./lift');
Sails.prototype.initialize = require('./initialize');
Sails.prototype.lower = require('./lower');
Sails.prototype.request = require('./request');
Sails.prototype.getBaseurl = require('./getBaseurl');


// Private methods and libs:
////////////////////////////////////////////////////////

Sails.prototype.exposeGlobals = require('./exposeGlobals');
Sails.prototype.runBootstrap = require('./bootstrap');
Sails.prototype.getHost = require('./getHost');
Sails.prototype.isLocalSailsValid = require('./isLocalSailsValid');
Sails.prototype.isSailsAppSync = require('./isSailsAppSync');
Sails.prototype.util = require('sails-util');



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
