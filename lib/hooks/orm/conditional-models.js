/**
 * Dependencies
 */
var _     = require('lodash');
var async = require('async');

/**
 * Private
 */

 /**
  * Get all models declared in collection definition.
  */
 var _getAllModels = function(collection){
  var models = [];
  for(var model in collection) models.push(model);
  return models;
 };

 /**
  * Check if a determinate model is available in a list.
  */
 var _isModelAvailable = function(list, item){
   result = _.indexOf(list, item.toLowerCase());
   if (result === -1) return false;
   return true;
 };

 /**
  * Return the models that have define a conditiona definition.
  */
 var _getAllModelsWithConditionalSchema = function(collection, models){
  var modelsConditional = _.filter(models, function(model){
    return _.has(collection[model], 'conditionals');
  });
  return modelsConditional;
 };

 /**
  * Sanetize the schema deleting the conditiona schemas that are not possible
  * to resolved.
  */
 var _sanetizeConditionalSchema = function(collection, models, modelsConditional){
  async.each(modelsConditional, function(model){
    var conditionalSchema = collection[model].conditionals;
    var modelsConditionalSchema = _getAllModels(conditionalSchema);

    async.each(modelsConditionalSchema, function(condition){
      if(!(_isModelAvailable(models, condition)))
        delete collection[model].conditionals[condition];
    });
    if (_.isEmpty(conditionalSchema))
      delete collection[model].conditionals;
  });
  return collection;
 };

 /**
  * Merge schema with conditionals schema into one.
  */
 var _mergeSchemas = function(collection){
  var models = _getAllModels(collection);
  var modelsWithConditionalSchema = _getAllModelsWithConditionalSchema(collection, models);

  async.each(modelsWithConditionalSchema, function(model){
    var conditionalSchema = collection[model].conditionals;
    _.forEach(conditionalSchema, function(condition){
      _.merge(collection[model], condition);
    });
    delete collection[model].conditionals;
  });
  return collection;
 };

/**
 * Exports
 */
module.exports = function conditional_models(modelsConfig){
  var models = _getAllModels(modelsConfig);
  var modelsWithConditionalSchema = _getAllModelsWithConditionalSchema(modelsConfig, models);
  var modelsConfigSanetize = _sanetizeConditionalSchema(modelsConfig, models, modelsWithConditionalSchema);
  return _mergeSchemas(modelsConfigSanetize);
};
