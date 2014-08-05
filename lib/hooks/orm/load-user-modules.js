/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');


module.exports = function howto_lookupUserModules (sails) {

  return function lookupUserModules (cb) {

    sails.log.verbose('Loading the app\'s models and adapters...');
    async.auto({

      models: function(cb) {
        sails.log.verbose('Loading app models...');

        // sails.models = {};

        // Load app's model definitions
        // Case-insensitive, using filename to determine identity
        sails.modules.loadModels(function modulesLoaded(err, modules) {
          if (err) return cb(err);
          sails.models = _.extend(sails.models || {}, modules);
          return cb();
        });
      },

      adapters: function(cb) {
        sails.log.verbose('Loading app adapters...');

        // sails.adapters = {};

        // Load custom adapters
        // Case-insensitive, using filename to determine identity
        sails.modules.loadAdapters(function modulesLoaded(err, modules) {
          if (err) return cb(err);
          sails.adapters = _.extend(sails.adapters || {}, modules);
          return cb();
        });
      }

    }, cb);
  };

};
