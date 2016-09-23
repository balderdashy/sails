/**
 * Module dependencies.
 */
var _ = require('lodash');
var async = require('async');

/**
 * Sails.prototype.reloadModules()
 *
 * Reload modules for any hook that has `loadModules` method.
 *
 * @param {Dictionary} options
 *        @property {Array} skipHooks Array of identities of hooks to _not_ reload modules for.
 *
 */
module.exports = function reloadModules(options, cb) {

  var sails = this;

  // Allow for options to be left out.
  if (_.isFunction(options)) {
    cb = options;
    options = {};
  }
  // Default options to an empty dictionary.
  else if (!_.isObject(options)) {
    options = {};
  }

  // Add some hooks to `hooksToSkip` that should _always_ be skipped.
  var hooksToSkip = (options.hooksToSkip || []).concat('userconfig', 'moduleloader', 'userhooks');

  // The list of hooks we want to reload is the list of all hooks minus the hooks to skip.
  var hooksToReload = _.difference(_.keys(sails.hooks), hooksToSkip);

  // Clear the actions dictionary.
  sails._actions = {};

  // Clear the action middleware dictionary.
  sails._actionMiddleware = {};

  // Reload the modules.
  async.each(hooksToReload, function(hookIdentity, cb) {
    sails.hooks[hookIdentity].loadModules(cb);
  }, function doneReloadingHooks(err) {
    if (err) {return cb(err);}
    // Reload the controller actions.
    sails.controller.loadModules(cb);
  });


};
