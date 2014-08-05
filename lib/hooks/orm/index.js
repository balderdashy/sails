/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var howto_loadAppModelsAndAdapters = require('./load-user-modules');
var howto_normalizeModelDef = require('./normalize-model');
var howto_buildORM = require('./build-orm');
var howto_backwardsCompatibleConfig = require('./backwards-compatibility/upgrade-sails.config');




module.exports = function(sails) {

  // Hydrate freeze-dried (context-free) modules using the sails app instance
  var loadAppModelsAndAdapters = howto_loadAppModelsAndAdapters(sails);
  var backwardsCompatibleConfig = howto_backwardsCompatibleConfig(sails);
  var normalizeModelDef = howto_normalizeModelDef(sails);
  var buildORM = howto_buildORM(sails);



  /**
   * Hook definition
   */

  var hook = {

    defaults: {

      globals: {
        adapters: true,
        models: true
      },

      // Default model properties
      models: {

        // This default connection (i.e. datasource) for the app
        // will be used for each model unless otherwise specified.
        connection: 'localDiskDb'
      },


      // Connections to data sources, web services, and external APIs.
      // Can be attached to models and/or accessed directly.
      connections: {

        // Built-in disk persistence
        // (by default, creates the file: `.tmp/localDiskDb.db`)
        localDiskDb: {
          adapter: 'sails-disk'
        }
      }
    },

    configure: function() {

      // Backwards compatibilty
      sails.config = backwardsCompatibleConfig(sails.config);

      // Listen for reload events
      sails.on('hook:orm:reload', hook.reload);

      // Listen for lower event, and tear down all of the adapters
      sails.on('lower', hook.teardown);
    },


    ////////////////////////////////////////////////////////////////////////////
    // NOTE: If a user hook needs to add or modify model definitions,
    // the hook should wait until `hook:orm:loaded`, then reload the original
    // model modules `orm/loadUserModules`. Finally, the ORM should be flushed using
    // `reload()` below.
    ////////////////////////////////////////////////////////////////////////////
    initialize: function(cb) {

      async.auto({

        // Load model and adapter definitions defined in the project
        _loadModules: function (next) {
          loadAppModelsAndAdapters(next);
        },

        // Normalize model definitions and merge in defaults from
        // `sails.config.models.*`
        normalizedModelDefs: ['_loadModules', function normalizeModelDefs(next) {
            _.each(sails.models, function (model, identity) {
              normalizeModelDef(model, identity);
            });
            next(null, sails.models);
          }
        ],

        // Once all user model and adapter definitions are loaded
        // and normalized, go ahead and initialize the ORM, which
        // creates instantiated model objects and stuffs them in
        // sails.models.
        instantiatedCollections: ['normalizedModelDefs', function (next, async_data) {
          buildORM(async_data.normalizedModelDefs, next);
        }]

      }, cb);
    },


    // Reload ORM hook
    // (which mostly just runs the hook's `initialize()` fn again)
    reload: function () {

      // Teardown all of the adapters, since initialize() will restart them
      hook.teardown(function() {
        hook.initialize(function(err) {
          if (err) {
            sails.log.error('Failed to reinitialize ORM.');
            sails.log.error(err);
            // TODO: emit "error" on app instance instead of throwing
            throw new Error(err);
          }
          else {
            // If the re-initialization was a success, trigger an event
            // in case something needs to respond to the ORM reload (e.g. pubsub hook)
            sails.emit('hook:orm:reloaded');
          }
        });
      });
    },


    // Teardown ORM hook
    teardown: function (cb) {
      cb = cb || function(err) {
        if (err) {
          sails.log.error('Failed to teardown ORM hook.');
          sails.log.error(err);
        }
      };
      async.forEach(Object.keys(sails.adapters), function(name, cb) {
        var adapter = sails.adapters[name];
        if (adapter.teardown) {
          adapter.teardown(null, cb);
        } else {
          cb();
        }
      }, cb);
    }
  };

  return hook;

};
