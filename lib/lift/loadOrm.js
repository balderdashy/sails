var Waterline = require('waterline'),
    async = require('async'),
    fs = require('fs'),
    _ = require('lodash');

module.exports = function (cb) {
  sails.log.verbose('Loading ORM...');


  /**
   * Resolve Adapter
   *
   * Will take in an adapter string from a model and either set it to the default
   * or lookup the adapter config from the config/adapters.js file.
   *
   * Normalizes to an array for Waterline to support multiple adapters per model
   */

  function resolveAdapter(adapters) {

    // If model doesn't have an adapter defined set it to the default adapter
    if(!adapters) return [sails.config.adapters['default'].module];

    // Normalize adapter to an array
    if(!Array.isArray(adapters)) adapters = [adapters];

    // Loop through the adapters and normalize the names to actual module names
    // adapters.forEach(function(adapter) {
    for(var i = 0; i < adapters.length; i++) {

      // If adapter is not in known adapters, just use the name
      if(!sails.config.adapters[adapters[i]]) return adapters;

      // If no module is defined for this adapter, just use the name
      if(!sails.config.adapters[adapters[i]].module) return adapters;

      // Transform the convience key to a module name
      adapters[i] = sails.config.adapters[adapters[i]].module;
    }

    return adapters;
  }


  /**
   * Load Adapters
   *
   * Load any adapters not defined in Sails, ex: sails-postgresql, sails-mongo
   * These need to be in the apps node_modules folder or an error will be thrown.
   */

  function loadAdapters(model) {

    // For each adapter, check if we have loaded it already
    var adapters = sails.models[model].adapter,
        adapter,
        modulePath,
        exists;

    for(var i = 0; i < adapters.length; i++) {
      adapter = adapters[i];

      // Check if adapter is already loaded
      if(sails.adapters[adapter]) return;

      // Try and load adapter from node_modules if it exists
      sails.log.verbose('Loading adapter for ' + model, '(', adapter, ')');
      modulePath = sails.config.paths.app + '/node_modules/' + adapter;
      exists = fs.existsSync(modulePath);

      // If adapter doesn't exist, log an error and exit
      if(!exists) {
        sails.log.error('To use ' + adapter + ', please run `npm install ' + adapter + '`');
        process.exit(1);
      }

      // Try and require the Module
      try {
        sails.adapters[adapter] = require(modulePath);
      } catch(err) {
        sails.log.error('There was an error attempting to load ' + adapter + ' is this an adapter?');
        sails.log.error(err);
        process.exit(1);
      }
    }
  }


  /**
   * Mixin Sails Config with Adapter Defaults
   *
   * Sets the adapter.config attribute to an actual config object containing the values
   * set in the config/adapters.js file and the defaults from the adapter.
   */

  function buildAdapterConfig(adapterName) {

    var adapter = sails.adapters[adapterName];

    // Find the correct adapter config, this is needed because config can be a
    // short name but all adapters are normalized to their module name
    Object.keys(sails.config.adapters).forEach(function(key) {

      var adapterConfig = sails.config.adapters[key];

      // Check if this adapter has the same module name or the
      // same config key
      if(adapterConfig.module) {
        if(adapterConfig.module !== adapterName) return;
      } else {
        if(key !== adapterName) return;
      }

      // Ensure a config object is set on the adapter
      adapter.config = adapter.config || {};

      // Ensure a defaults object is set on the adapter
      adapter.defaults = adapter.defaults || {};

      _.extend(
        adapter.config,
        adapter.defaults,
        adapterConfig
      );

    });
  }

  /**
   * Mixes in a model default with the adapter config
   *
   * Used to override an adapter's config on a per model basis
   */

  function overrideConfig(model) {

    var adapters = _.clone(sails.adapters);

    // If no custom config is defined return the adapters
    if(!sails.models[model].config) return adapters;

    var config = sails.models[model].config;

    sails.models[model].adapter.forEach(function(adapter) {

      // Extend adapter config
      _.extend(adapters[adapter].config, config);
    });

    return adapters;
  }


  /**
   * Instantiate a new Waterline Collection from the Sails Model
   */

  function loadCollection(model, cb) {

    // Wrap model in Waterline.Collection.extend
    var Model = Waterline.Collection.extend(sails.models[model]);

    // Mixin local model defaults to the adapters passed into the model
    var adapters = overrideConfig(model);

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

  // Alias sails.model to Waterline.Collection
  sails.model = Waterline.Collection;

  // "Resolve" Adapters
  // Ensures that each model has somthing set for the adapter
  _.each(sails.models, function (model, identity) {
    model.adapter = resolveAdapter(model.adapter);
  });

  // Load all external adapters used in models
  _.each(sails.models, function (model, identity) {
    loadAdapters(identity);
  });

  // Build Config for each adapter
  _.each(sails.adapters, function(adapter, identity) {
    buildAdapterConfig(identity);
  });

  // Loop through models and instantiate a Waterline Collection
  async.each(Object.keys(sails.models), loadCollection, function(err) {
    if(err) return cb(err);
    cb();
  });

};
