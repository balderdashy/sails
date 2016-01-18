/**
 * Module dependencies
 */

var _ = require('lodash');
var Err = require('../../../../errors');

module.exports = function (sails) {
  return function (modelDef) {

    // Backwards compatibilty for `Model.adapter`
    if (modelDef.adapter && typeof modelDef.connection === 'undefined') {
      sails.log.verbose(
        'Deprecation warning :: ' +
        'Replacing `' + modelDef.globalId + '.adapter` ' +
        'with `' + modelDef.globalId + '.connection`....');
      modelDef.connection = modelDef.adapter;
      delete modelDef.adapter;
    }

    // Backwards compatiblity for lifecycle callbacks
    if (modelDef.beforeValidation) {
      sails.log.verbose(
        'Deprecation warning :: the `beforeValidation()` model lifecycle callback is now `beforeValidate()`.\n' +
        'For now, I\'m replacing it for you (in `' + modelDef.globalId + '`)...');
      modelDef.beforeValidate = modelDef.beforeValidation;
    }
    if (modelDef.afterValidation) {
      sails.log.verbose(
        'Deprecation warning :: the `afterValidation()` model lifecycle callback is now `afterValidate()`.\n' +
        'For now, I\'m replacing it for you (in `' + modelDef.globalId + '`)...');
      modelDef.afterValidate = modelDef.afterValidation;
    }

    return modelDef;
  };
};
