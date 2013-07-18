module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
      Hook = require('../../index'),
      i18n = require('i18n-abide');

  var i18n_middleware = i18n.abide({
    supported_languages: sails.config.i18n.locales,
    default_lang: sails.config.i18n.defaultLocale,
    translation_directory: sails.config.appPath + sails.config.i18n.localesDirectory,
    translation_type: sails.config.i18n.translationType
  });


  /**
   * Expose hook definition
   */

  return {

    routes: {

      before: {

        '/*': i18n_middleware

      }
    },

    // Always ready-- doesn't need to do anything asynchronous
    // (err sort of- but it's fine)
    ready: true

  };
};
