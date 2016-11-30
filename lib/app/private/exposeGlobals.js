/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
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

  // Implicit default for globals is `false`.
  // Note that this may not be what the default `config/globals.js`
  // settings are.
  if (_.isUndefined(sails.config.globals)) {
    sails.config.globals = false;
    return;
  }

  // If globals config is provided, it must be either `false` or a dictionary.
  else if (sails.config.globals !== false && (!_.isObject(sails.config.globals) || _.isArray(sails.config.globals) || _.isFunction(sails.config.globals))) {
    throw flaverr('E_BAD_GLOBAL_CONFIG', new Error('In Sails v1.x, if `sails.config.globals` is defined, it must either be a dictionary or `false`.  If `undefined`, it will default to `false` (no globals).'));
  }

  // Globals explicitly disabled.
  if (sails.config.globals === false) {
    sails.log.verbose('No global variables will be exposed.');
    return;
  }

  sails.log.verbose('Exposing global variables... (you can customize/disable this by modifying the properties in `sails.config.globals`.  Set it to `false` to disable all globals.)');

  // `sails.config.globals._` must be false or an object.
  // (it's probably a function with lots of extra properties, but to future-proof, we'll allow any type of object)
  if (sails.config.globals._ !== false) {
    if (!_.isObject(sails.config.globals._)) {
      throw flaverr('E_BAD_GLOBAL_CONFIG', new Error('In Sails v1.x, `sails.config.globals._` must be either `false` or an object (typically the value of `require(\'lodash\')`)'));
    }
    global['_'] = sails.config.globals._;
  }
  // `sails.config.globals.async` must be false or an object.
  // (it's probably a plain object aka dictionary, but to future-proof, we'll allow any type of object)
  if (sails.config.globals.async !== false) {
    if (!_.isObject(sails.config.globals.async)) {
      throw flaverr('E_BAD_GLOBAL_CONFIG', new Error('In Sails v1.x, `sails.config.globals.async` must be either `false` or an object (typically the value of `require(\'async\')`)'));
    }
    global['async'] = sails.config.globals.async;
  }

  // `sails.config.globals.sails` must be a boolean
  if (sails.config.globals.sails !== false) {
    if (sails.config.globals.sails !== true) {
      throw flaverr('E_BAD_GLOBAL_CONFIG', new Error('In Sails v1.x, `sails.config.globals.sails` must be either `true` or `false` (you may need to uncomment the `sails` setting in your `config/globals.js` file).'));
    }
    global['sails'] = sails;
  }

  // `sails.config.globals.models` must be a boolean.
  // `orm` hook takes care of actually globalizing models and adapters (if enabled)
  if (sails.config.globals.models !== false && sails.config.globals.models !== true) {
    throw flaverr('E_BAD_GLOBAL_CONFIG', new Error('In Sails v1.x, `sails.config.globals.models` must be either `true` or `false` (you may need to uncomment the `models` setting in your `config/globals.js` file).'));
  }

  // `services` hook takes care of globalizing services (if enabled)
  // It does this by default for now, so that we don't have to document configuring
  // services, which we're trying to phase out in favor of helpers.

};
