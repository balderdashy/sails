/**
 * Module dependencies.
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');


/**
 * exposeGlobals()
 *
 * Expose certain global variables
 * (if config says so)
 *
 * @throws E_BAD_GLOBAL_CONFIG
 *
 * @this {SailsApp}
 * @api private
 */

module.exports = function exposeGlobals() {
  var sails = this;

  // Implicit default for globals is `false`, to allow for intuitive programmatic
  // usage of `sails.lift()`/`sails.load()` in automated tests, command-line scripts,
  // scheduled jobs, etc.
  //
  // > Note that this is not the same as the boilerplate `config/globals.js` settings,
  // > since the use of certain global variables is still the recommended approach for
  // > the code you write in your Sails app's controller actions, etc.
  if (_.isUndefined(sails.config.globals)) {
    sails.config.globals = false;
    return;
  }

  // If globals config is provided, it must be either `false` or a dictionary.
  else if (sails.config.globals !== false && (!_.isObject(sails.config.globals) || _.isArray(sails.config.globals) || _.isFunction(sails.config.globals))) {
    throw flaverr({ name: 'userError', code: 'E_BAD_GLOBAL_CONFIG' }, new Error('As of Sails v1, if `sails.config.globals` is defined, it must either be `false` or a dictionary (plain JavaScript object) or `false`.  But instead, got: '+util.inspect(sails.config.globals, {depth:null})+'\n> Note: if no globals config is specified, Sails will now assume `false` (no globals).  This is to allow for more intuitive programmatic usage.\nFor more info, see http://sailsjs.com/config/globals'));
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
      throw flaverr({ name: 'userError', code: 'E_BAD_GLOBAL_CONFIG' }, new Error('As of Sails v1, `sails.config.globals._` must be either `false` or a locally-installed version of Lodash (typically `require(\'lodash\')`).  For more info, see http://sailsjs.com/config/globals'));
    }
    global['_'] = sails.config.globals._;
  }
  // `sails.config.globals.async` must be false or an object.
  // (it's probably a plain object aka dictionary, but to future-proof, we'll allow any type of object)
  if (sails.config.globals.async !== false) {
    if (!_.isObject(sails.config.globals.async)) {
      throw flaverr({ name: 'userError', code: 'E_BAD_GLOBAL_CONFIG' }, new Error('As of Sails v1, `sails.config.globals.async` must be either `false` or a locally-installed version of `async` (typically `require(\'async\')`)  For more info, see http://sailsjs.com/config/globals'));
    }
    global['async'] = sails.config.globals.async;
  }

  // `sails.config.globals.sails` must be a boolean
  if (sails.config.globals.sails !== false) {
    if (sails.config.globals.sails !== true) {
      throw flaverr({ name: 'userError', code: 'E_BAD_GLOBAL_CONFIG' }, new Error('As of Sails v1, `sails.config.globals.sails` must be either `true` or `false` (Tip: you may need to uncomment the `sails` setting in your `config/globals.js` file).  For more info, see http://sailsjs.com/config/globals'));
    }
    global['sails'] = sails;
  }

  // `sails.config.globals.models` must be a boolean.
  // `orm` hook takes care of actually globalizing models and adapters (if enabled)
  if (sails.config.globals.models !== false && sails.config.globals.models !== true) {
    throw flaverr({ name: 'userError', code: 'E_BAD_GLOBAL_CONFIG' }, new Error('As of Sails v1, `sails.config.globals.models` must be either `true` or `false` (you may need to uncomment the `models` setting in your `config/globals.js` file).  For more info, see http://sailsjs.com/config/globals'));
  }

  // `services` hook takes care of globalizing services (if enabled)
  // It does this by default for now, so that we don't have to document configuring
  // services, which we're trying to phase out in favor of helpers.

};
