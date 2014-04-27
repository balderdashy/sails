/**
 * Module dependencies.
 */

var events = require('events');
var _ = require('lodash');
var util = require('util');
var loadSails = require('./load');
var mixinAfter = require('./after');


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

// Presentation
Sails.prototype.inspect = function () {
  var sails = this;

  return util.format('\n'+
  '  |>   %s', this.toString()) + '\n' +
  '\\___/  For help, see: http://links.sailsjs.org/docs'+
  '\n\n' +
  'Tip: Use `sails.config` to access your app\'s runtime configuration.'+
  '\n\n' +
  util.format('%d Models:\n', _(sails.models).toArray().value().length) +
  _(sails.models).toArray().filter(function (it) {return !it.junctionTable;}).pluck('globalId').value() +
  '\n\n' +
  util.format('%d Controllers:\n', _(sails.controllers).toArray().value().length)+
  _(sails.controllers).toArray().pluck('globalId').map(function (it) {return it+'Controller';}).value() +
  '\n\n' +
  // 'Routes:\n'+
  // _(sails.routes).toArray().filter(function (it) {return !it.junctionTable;}).pluck('globalId').map(function (it) {return it+'Controller';}).value() +
  // '\n\n' +
  util.format('%d Hooks:\n', _(sails.hooks).toArray().value().length)+
  _(sails.hooks).toArray().pluck('identity').value() +
  '\n' +
  '';

};
Sails.prototype.toString = function ( ) {
  return util.format('[a %sSails app%s]', this.isLifted ? 'lifted ' : '', this.isLifted && this.config.port ? ' on port '+this.config.port : '');
};
Sails.prototype.toJSON = function ( ) {
  return _.reduce(this, function (pojo, val, key) {
    if (key === 'config') {
      pojo[key] = val;
    }
    if (key === 'hooks') {
      pojo[key] = _.reduce(val, function (memo, hook, ident) {
        memo.push(ident);
        return memo;
      }, []);
    }
    if (key === 'models') {
      pojo[key] = _.reduce(val, function (memo, model, ident) {
        if (!model.junctionTable) {
          memo.push({
            attributes: model.attributes,
            identity: model.identity,
            globalId: model.globalId,
            connection: model.connection,
            schema: model.schema,
            tableName: model.tableName
          });
        }
        return memo;
      }, []);
    }

    return pojo;
  }, {});
};


// Expose Sails constructor
module.exports = Sails;
