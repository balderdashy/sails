/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var async = require('async');


/**
 * exposeGlobals()
 *
 * Expose certain global variables
 * (if config says so)
 *
 * @api private
 */

module.exports = function exposeGlobals() {
  var sails = this;


  // Globals explicitly disabled
  if (sails.config.globals === false) {
    sails.log.verbose('No global variables will be exposed.');
    return;
  }

  sails.log.verbose('Exposing global variables... (you can customize/disable this by modifying the properties in `sails.config.globals`.  Set it to `false` to disable all globals.)');

  sails.config.globals = sails.config.globals || {};

  // Provide global access (if allowed in config)
  if (sails.config.globals._ !== false) {
    global['_'] = _;
  }
  if (sails.config.globals.async !== false) {
    global['async'] = async;
  }
  if (sails.config.globals.sails !== false) {
    global['sails'] = sails;
  }

  // `services` hook takes care of globalizing services (if enabled)

  // `orm` hook takes care of globalizing models and adapters (if enabled)

};
