module.exports = function (sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
    Hook = require('../../index'),
    i18n = require('i18n'),
    locale = require("locale");

  i18n.configure({
    locales: sails.config.i18n.locales,
    directory: sails.config.appPath + sails.config.i18n.localesDirectory,
    defaultLocale: sails.config.i18n.defaultLocale
  });

  /**
   * Expose hook definition
   */

  return {

    routes: {

      before: {

        '/*': function (req, res, next) {
          locale(sails.config.i18n.locales)(req, res, function(){
            res.locals.i18n = res.i18n = function() {
              return i18n.__.apply(req, arguments);
            };
            next()
          });
        }

      }
    },

    // Always ready-- doesn't need to do anything asynchronous
    // (err sort of- but it's fine)
    ready: true

  };
};