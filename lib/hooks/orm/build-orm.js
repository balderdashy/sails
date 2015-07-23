/**
 * Module dependencies
 */

var _ = require('lodash');
var Waterline = require('waterline');


/**
 * Instantiate Waterline model for each Sails Model,
 * then start the ORM.
 *
 * @param {Object}    modelDefs
 * @param {Function}  cb
 *              -> err  // Error, if one occurred, or null
 */

module.exports = function howto_buildORM(sails) {
  return function buildORM(modelDefs, cb) {

    // If sails is already exiting due to previous errors, bail out.
    // This could happen if another hook fails to load.
    if (sails._exiting) {return cb("SAILS EXITING");}

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
    }, function (err, orm) {
      if (err) return cb(err);

      var models = orm.collections || [];

      _.each(models,function eachInstantiatedModel(thisModel, modelID) {

        // Bind context for models
        // (this (breaks?)allows usage with tools like `async`)
        _.bindAll(thisModel);

        // Derive information about this model's associations from its schema
        // and attach/expose the metadata as `SomeModel.associations` (an array)
        thisModel.associations = _.reduce(thisModel.attributes, function (associatedWith, attrDef, attrName) {
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
          return associatedWith;
        }, []);

        // Set `sails.models.*` reference to instantiated Collection
        // Exposed as `sails.models[modelID]`
        sails.models[modelID] = thisModel;

        // Create global variable for this model
        // (if enabled in `sails.config.globals`)
        // Exposed as `[globalId]`
        if (sails.config.globals && sails.config.globals.models) {
          var globalName = sails.models[modelID].globalId || sails.models[modelID].identity;
          global[globalName] = thisModel;
        }
      });

      // Success
      cb();
    });
  };
};
