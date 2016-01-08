var _ = require('lodash');
var async = require('async');

module.exports = function howto_lookupUserModules (sails) {

  return function lookupUserModules (cb) {

    sails.log.verbose('Loading the app\'s models and adapters...');
    async.auto({

      models: function(cb) {
        sails.log.verbose('Loading app models...');

        // Load app's model definitions
        // Case-insensitive, using filename to determine identity.
        // (This calls out to the `moduleloader` hook, which uses `sails-build-dictionary` and `includeall`
        //  to `require` and collate the relevant code for these modules-- also adding an appropriate `globalId`
        //  property.  If configured to do so, Sails will use this `globalId` to expose your models process-wide
        //  as globals.)
        sails.modules.loadModels(function modulesLoaded(err, modules) {
          if (err) return cb(err);
          _.merge(sails.models, modules);
          return cb();
        });
      },

      adapters: function(cb) {
        sails.log.verbose('Loading app adapters...');

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
