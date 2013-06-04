var Waterline = require('waterline'),
    async = require('async'),
    fs = require('fs'),
    _ = require('lodash');

module.exports = function (cb) {
  sails.log.verbose('Loading ORM...');

  // Alias sails.model to Waterline.Collection
  sails.model = Waterline.Collection;

  // "Resolve" adapters
  // Merge Sails' concept with the actual realities of adapter definitions in npm
  _.each(sails.models, function (model, modelIdentity) {
    _.extend(model, _.clone(resolveAdapter(model.adapter)));
  });

  // Return {} if the adapter is resolved
  function resolveAdapter (adapter, key, depth) {
    if(!depth) depth = 0;
    if(depth > 5) return adapter;

    // Return default adapter if this one is unspecified
    if(!adapter) return resolveAdapter(sails.config.adapters['default'], 'default', depth+1);

    // Try to look up adapter name in registered adapters for this app
    if(_.isString(adapter)) {
      var lookupAttempt = sails.config.adapters[adapter];

      if(lookupAttempt) return resolveAdapter (lookupAttempt, adapter, depth+1);

      // If it's not a match, go ahead and wrap it in an object and return
      // this must be a module name
      return {adapter: adapter};
    }

    // Config was specified as an object
    if(_.isObject(adapter)) {

      // If 'module' is specified, use that in lieu of the convenience key
      if(adapter.module) adapter.adapter = adapter.module;

      // Otherwise, use the convenience key and hope it's right!
      else adapter.adapter = key;

      return adapter;
    }

    else throw new Error('Unexpected result:  Adapter definition could not be resolved.');
  }

  // Load Any External Adapters
  Object.keys(sails.models).forEach(function(model) {

    // Check if Model has an adapter defined
    if(!sails.models[model].adapter) return;

    var adapterName = sails.models[model].adapter;

    // Check if adapter is already loaded
    if(sails.adapters[adapterName]) return;

    // Try and load adapter from node_modules
    // var module = sails.config.adapters[model.adapter].module;
    var modulePath = sails.config.paths.app + '/node_modules/' + adapterName;
    var exists = fs.existsSync(modulePath);

    if(!exists) return;

    // Require Module
    sails.adapters[adapterName] = require(modulePath);
  });


  // Instantiate each model as a Waterline Collection
  function loadCollection(model, cb) {
    var Model = Waterline.Collection.extend(sails.models[model]);

    new Model({

      // Pass in a default tableName, can be overwritten in a model definition
      tableName: model,

      // Pass in all the adapters Sails knows about
      adapters: sails.adapters

    }, function(err, collection) {
      if(err) return cb(err);

      // Set Model to instantiated Collection
      sails.models[model] = collection;

      // Globalize Model if Enabled
      if(sails.config.globals.models) {
        var capitalName = model.charAt(0).toUpperCase() + model.slice(1);
        global[capitalName] = collection;
      }

      cb();
    });
  }

  // Loop through models and instantiate a Waterline Collection
  async.each(Object.keys(sails.models), loadCollection, function(err) {
    if(err) return cb(err);
    cb();
  });

};
