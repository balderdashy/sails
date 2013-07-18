module.exports = function (sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
      Hook = require('../../index'),
      i18n = require('i18n');

  i18n.configure({
    locales: sails.config.i18n.locales,
    directory: sails.config.appPath + sails.config.i18n.localesDirectory,
    defaultLocale: sails.config.i18n.defaultLocale,
    updateFiles: false
  });

  /**
   * Expose hook definition
   */

  return {

    routes: {

      before: {

        '/*': function (req, res, next) {

          i18n.init(req, res, function() {

            res.locals.i18n = res.i18n = function(phrase) {
              return i18n.__(phrase);
            };

            next();
          });

        }
      }
    },

    // Always ready-- doesn't need to do anything asynchronous
    // (err sort of- but it's fine)
    ready: true

  };
};
