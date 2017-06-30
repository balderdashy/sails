/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var async = require('async');
var loadActionModules = require('./private/controller/load-action-modules');


/**
 * Sails.prototype.reloadActions()
 *
 * Reload actions for any hook that has a `registerActions` method.
 *
 * @param {Dictionary} options
 *        @property {Array} skipHooks Array of identities of hooks to _not_ reload actions for.
 *
 */
module.exports = function reloadActions(options, cb) {

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

  // Default `hooksToSkip` to an empty array.
  var hooksToSkip = options.hooksToSkip || [];

  // The list of hooks we want to reload is the list of all hooks minus the hooks to skip.
  var hooksToReload = _.difference(_.keys(sails.hooks), hooksToSkip);

  // Clear the actions dictionary.
  sails._actions = {};

  // Reload the actions.
  async.each(hooksToReload, function(hookIdentity, next) {
    if (_.isFunction(sails.hooks[hookIdentity].registerActions)) {
      sails.hooks[hookIdentity].registerActions(next);
    } else {
      return next();
    }
  }, function doneReloadingActions(err) {
    if (err) {return cb(err);}
    // Reload the controller actions.
    loadActionModules(sails, cb);
  });


};
