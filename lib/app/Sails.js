/**
 * Module dependencies.
 */

var events = require('events');
var _ = require('lodash');
var util = require('util');
var loadSails = require('./load');
var mixinAfter = require('./private/after');
var __Router = require('../router');
var CaptainsLog = require('captains-log');



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

  // Ensure CaptainsLog exists
  this.log = CaptainsLog();

  // Build a Router instance (which will attach itself to the sails object)
  __Router(this);

  // Mixin `load()` method to load the pieces
  // of a Sails app
  this.load = loadSails(this);

  // Mixin support for `Sails.prototype.after()`
  mixinAfter(this);

  // Bind `this` context for all `Sails.prototype.*` methods
  var prototypeMethods = ['load', 'request', 'lift', 'lower', 'getBaseurl', 
    'initialize', 'exposeGlobals', 'runBootstrap', 'getHost', 
    'isLocalSailsValid', 'isSailsAppSync', 'inspect', 'toString',
    'toJSON', 'all', 'get', 'post', 'put', 'delete'];

  var me = this;
  _.each(prototypeMethods, function(method) {
    me[method] = _.bind(me[method], me);
  });
}


// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Sails, events.EventEmitter);


// Public methods
////////////////////////////////////////////////////////

Sails.prototype.lift = require('./lift');

Sails.prototype.lower = require('./lower');

Sails.prototype.getBaseurl = require('./getBaseurl');
Sails.prototype.getBaseURL = Sails.prototype.getBaseurl;
Sails.prototype.getBaseUrl = Sails.prototype.getBaseurl;

Sails.prototype.request = require('./request');

// Expose Express-esque synonyms for low-level usage of router
var _routerBindWrapper = function (path, action) {
  this.router.bind(path, action);
  return this;
};
Sails.prototype.all       = _routerBindWrapper;
Sails.prototype.get       = _routerBindWrapper;
Sails.prototype.post      = _routerBindWrapper;
Sails.prototype.put       = _routerBindWrapper;
Sails.prototype.del = Sails.prototype['delete'] = _routerBindWrapper;


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
