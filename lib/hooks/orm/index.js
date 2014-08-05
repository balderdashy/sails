/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var Waterline = require('waterline');
var howto_loadAppModelsAndAdapters = require('./load-user-modules');
var howto_normalizeModelDef = require('./normalize-model');
var howto_lookupDatastore = require('./lookup-datastore');
var howto_backwardsCompatibleConfig = require('./backwards-compatibility/upgrade-sails.config');




module.exports = function(sails) {

  // Hydrate freeze-dried (context-free) modules using the sails app instance
  var loadAppModelsAndAdapters = howto_loadAppModelsAndAdapters(sails);
  var backwardsCompatibleConfig = howto_backwardsCompatibleConfig(sails);
  var normalizeModelDef = howto_normalizeModelDef(sails);
  var lookupDatastore = howto_lookupDatastore(sails);



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
    },

    initialize: function(cb) {

      ////////////////////////////////////////////////////////////////////////////
      // NOTE: If a user hook needs to add or modify model definitions,
      // the hook should wait until `hook:orm:loaded`, then reload the original
      // model modules `orm/loadUserModules`. Finally, the ORM should be flushed using
      // `restart()` below.
      ////////////////////////////////////////////////////////////////////////////

      // Load model and adapter definitions defined in the project
      async.auto({

        _loadModules: loadAppModelsAndAdapters,

        // Normalize model definitions and merge in defaults from `sails.config.models`
        modelDefs: ['_loadModules',
          function normalizeModelDefs(cb) {
            _.each(sails.models, normalizeModelDef);
            cb(null, sails.models);
          }
        ],

        // Once all user model definitions are loaded into sails.models,
        // go ahead and start the ORM, instantiate the models
        instantiatedCollections: ['modelDefs', hook.startORM],


        _prepareModels: ['instantiatedCollections', hook.prepareModels]

      }, cb);
    },


    /**
     * Instantiate Waterline Collection for each Sails Model,
     * then start the ORM.
     *
     * @param {Function}  cb
     *              -> err  // Error, if one occurred, or null
     *
     * @param {Object}    stack
     *            stack.modelDefs {}
     *
     * @global {Object}   sails
     *            sails.models {}
     */
    startORM: function(cb, stack) {
      var modelDefs = stack.modelDefs;

      // -> Instantiate ORM in memory.
      // -> Iterate through each model definition:
      //    -> Create a proper Waterline Collection for each model
      //    -> then register it w/ the ORM.
      sails.log.verbose('Starting ORM...');
      var waterline = new Waterline();
      _.each(modelDefs, function loadModelsIntoWaterline(modelDef, modelID) {
        sails.log.silly('Registering model `' + modelID + '` in Waterline (ORM)');
        waterline.loadCollection(Waterline.Collection.extend(modelDef));
      });

      // Find all the connections used
      var connections = _.reduce(sails.adapters, function getConnectionsInPlay(connections, adapter, adapterKey) {
        _.each(sails.config.connections, function(connection, connectionKey) {
          if (adapterKey === connection.adapter) {
            connections[connectionKey] = connection;
          }
        });
        return connections;
      }, {});

      // App defaults from `sails.config.models`
      var appDefaults = sails.config.models;

      // -> "Initialize" ORM
      //    : This performs tasks like managing the schema across associations,
      //    : hooking up models to their connections, and auto-migrations.
      waterline.initialize({
        adapters: sails.adapters,
        connections: connections,
        defaults: appDefaults
      }, cb);
    },


    /**
     * prepareModels
     *
     * @param {Function}  cb
     *              -> err  // Error, if one occurred, or null
     *
     * @param {Object}    stack
     *            stack.instantiatedCollections {}
     */
    prepareModels: function(cb, stack) {
      var collections = stack.instantiatedCollections.collections || [];

      Object.keys(collections).forEach(function eachInstantiatedCollection(modelID) {

        // Bind context for models
        // (this (breaks?)allows usage with tools like `async`)
        _.bindAll(collections[modelID]);

        // Derive information about this model's associations from its schema
        var associatedWith = [];
        _(collections[modelID].attributes).forEach(function buildSubsetOfAssociations(attrDef, attrName) {
          if (typeof attrDef === 'object' && (attrDef.model || attrDef.collection)) {
            var assoc = {
              alias: attrName,
              type: attrDef.model ? 'model' : 'collection'
            };
            if (attrDef.model) {
              assoc.model = attrDef.model;
            }
            if (attrDef.collection) {
              assoc.collection = attrDef.collection;
            }
            if (attrDef.via) {
              assoc.via = attrDef.via;
            }

            associatedWith.push(assoc);
          }
        });

        // Expose `Model.associations` (an array)
        collections[modelID].associations = associatedWith;


        // Set `sails.models.*` reference to instantiated Collection
        // Exposed as `sails.models[modelID]`
        sails.models[modelID] = collections[modelID];

        // Create global variable for this model
        // (if enabled in `sails.config.globals`)
        // Exposed as `[globalId]`
        if (sails.config.globals && sails.config.globals.models) {
          var globalName = sails.models[modelID].globalId || sails.models[modelID].identity;
          global[globalName] = collections[modelID];
        }
      });

      cb();
    }
  };

  return hook;

};
