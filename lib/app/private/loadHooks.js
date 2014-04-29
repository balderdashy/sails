/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var __hooks = require('../../hooks');


module.exports = function(sails) {

  var Hook = __hooks(sails);


  /**
   * Resolve the hook definitions and then finish loading them
   *
   * @api private
   */

  return function initializeHooks(hooks, cb) {

    // Instantiate Hook instances using definitions
    _.each(hooks, function(hookPrototype, id) {

      // Allow disabling of hooks by setting them to "false"
      // Useful for testing, but may cause instability in production!
      // I sure hope you know what you're doing :)
      if (hookPrototype === false || hooks[id.split('.')[0]] === false) {
        delete hooks[id];
        return;
      }

      // Check for invalid hook config
      if (hooks.userconfig && !hooks.moduleloader) {
        return cb('Invalid configuration:: Cannot use the `userconfig` hook w/o the `moduleloader` hook enabled!');
      }

      // Handle folder-defined modules (default to index.js)
      // Since a hook definition must be a function
      if (_.isObject(hookPrototype) && !_.isArray(hookPrototype) && !_.isFunction(hookPrototype)) {
        hookPrototype = hookPrototype.index;
      }

      if (!_.isFunction(hookPrototype)) {
        sails.log.error('Malformed hook! (' + id + ')');
        sails.log.error('Hooks should be a function with one argument (`sails`)');
        process.exit(1);
      }

      // Instantiate the hook
      var def = hookPrototype(sails);

      // Mix in an `identity` property to hook definition
      def.identity = id.toLowerCase();

      // New up an actual Hook instance
      hooks[id] = new Hook(def);
    });


    // Call `load` on each hook
    async.auto({

        initialize: function(cb) {
          async.each(_.keys(hooks), function initializeHook(id, cb) {
            sails.log.silly('Loading hook: ' + id);
            hooks[id].load(function(err) {
              if (err) {
                sails.log.error('A hook (`' + id + '`) failed to load!');
                sails.emit('hook:' + id + ':error');
                return cb(err);
              }

              sails.log.verbose(id, 'hook loaded successfully.');
              sails.emit('hook:' + id + ':loaded');

              // Defer to next tick to allow other stuff to happen
              process.nextTick(cb);
            });
          }, cb);
        }
      },

      function hooksReady(err) {
        return cb(err);
      });
  };

};
