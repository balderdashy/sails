/**
 * Module dependencies.
 */

var events = require('events');
var _ = require('lodash');
var util = require('util');
var loadSails = require('./load');
var mixinAfter = require('./private/after');
var __Router = require('../router');



/**
 * Construct a Sails (app) instance.
 *
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

  // Build a Router instance (which will attach itself to the sails object)
  __Router(this);

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

Sails.prototype.lower = require('./lower');

Sails.prototype.request = require('./request');

Sails.prototype.getBaseurl = require('./getBaseurl');
Sails.prototype.getBaseURL = Sails.prototype.getBaseurl;
Sails.prototype.getBaseUrl = Sails.prototype.getBaseurl;



// Private methods:
////////////////////////////////////////////////////////

Sails.prototype.initialize = require('./private/initialize');
Sails.prototype.exposeGlobals = require('./private/exposeGlobals');
Sails.prototype.runBootstrap = require('./private/bootstrap');
Sails.prototype.getHost = require('./private/getHost');
Sails.prototype.isLocalSailsValid = require('./private/isLocalSailsValid');
Sails.prototype.isSailsAppSync = require('./private/isSailsAppSync');

// Presentation
Sails.prototype.inspect = require('./private/inspect');
Sails.prototype.toString = require('./private/toString');
Sails.prototype.toJSON = require('./private/toJSON');

// Utilities
// Includes lodash, node's `util`, and a few additional
// static helper methods.
// (may be deprecated in a future release)
Sails.prototype.util = require('sails-util');

// Expose Sails constructor
module.exports = Sails;
