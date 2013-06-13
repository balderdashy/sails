var modelsLoader = require('../lift/loadModels'),
    utils = require('./utils'),
    async = require('async'),
    Waterline = require('waterline'),
    _ = require('lodash');

module.exports = {

  /**
   * Start the ORM by instantiating Waterline Collections
   */

  start: function(cb) {
    sails.log.verbose('Starting ORM...');

    // "Resolve" Adapters
    // Ensures that each model has somthing set for the adapter
    _.each(sails.models, function (model, identity) {
      model.adapter = utils.resolveAdapter(model.adapter);
    });

    // Load all external adapters used in models
    _.each(sails.models, function (model, identity) {
      utils.loadAdapters(identity);
    });

    // Build Config for each adapter
    _.each(sails.adapters, function(adapter, identity) {
      utils.buildAdapterConfig(identity);
    });

    // Loop through models and instantiate a Waterline Collection
    async.each(Object.keys(sails.models), loadCollection, function(err) {
      if(err) return cb(err);
      cb();
    });

  },

  /**
   * Stop the ORM by removing all references to instantiated models
   */

  stop: function() {
    sails.log.verbose('Stopping ORM...');

    // delete all references to sails.models and their global
    Object.keys(sails.models).forEach(function(model) {
      if(global[model.globalId]) {
        delete global[model.globalId];
      }

      delete sails.models[model];
    });
  },

  /**
   * Reload the ORM by removing all models and reloading them
   * then reinstantiate the Waterline Collections.
   */

  restart: function(cb) {
    sails.log.verbose('Restarting ORM...');

    var self = this;

    // Stop the ORM
    this.stop();

    // reload sails.models
    modelsLoader(function() {

      // Start the ORM
      self.start(cb);

    });
  }

};

/**
 * Instantiate a new Waterline Collection from the Sails Model
 */

function loadCollection(model, cb) {

  // Wrap model in Waterline.Collection.extend
  var Model = Waterline.Collection.extend(sails.models[model]);

  // Mixin local model defaults to the adapters passed into the model
  var adapters = utils.overrideConfig(model);

  new Model({

    // Pass in a default tableName, can be overwritten in a model definition
    tableName: model,

    // Pass in all the adapters Sails knows about
    adapters: adapters

  }, function(err, collection) {
    if(err) return cb(err);

    // Set Model to instantiated Collection
    sails.models[model] = collection;

    // Globalize Model if Enabled
    if(sails.config.globals.models) {
      var globalName = sails.models[model].globalId || sails.models[model].identity;
      global[globalName] = collection;
    }

    cb();
  });
}
