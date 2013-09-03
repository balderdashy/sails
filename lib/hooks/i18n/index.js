module.exports = function (sails) {

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
      Hook = require('../../index'),
      i18n = require('i18n'),
      domain = require('domain');


  /**
   * Expose hook definition
   */

  return {

    routes: {

      before: {

        '/*': function (req, res, next) {

          i18n.init(req, res, function() {
            res.locals.i18n = res.i18n = res.__;
            next();
          });

        }
      }
    },

    initialize: function (cb) {

      domain.create()

      // Catch
      .on('error', function(err) {
        sails.log.error(err);
      })

      // Try
      .run(function () {
        i18n.configure({
          locales: sails.config.i18n.locales,
          directory: sails.config.appPath + sails.config.i18n.localesDirectory,
          defaultLocale: sails.config.i18n.defaultLocale,
          updateFiles: false,
          extension: '.json'
        });
      });

      // Finally
      cb();
    }

  };
};
