module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash'),
    i18n,
    domain = require('domain');


  /**
   * Expose hook definition
   */

  return {

    defaults: {
      // i18n
      i18n: {
        locales: ['en', 'es', 'fr', 'de'],
        defaultLocale: 'en',
        localesDirectory: '/config/locales'
      }
    },

    routes: {

      before: {

        'all /*': function addLocalizationMethod (req, res, next) {

          i18n.init(req, res, function() {
            res.locals.i18n = res.i18n = res.__;
            next();
          });

        }
      }
    },

    initialize: function(cb) {

      i18n = require('i18n');

      // Create an error domain to catch errors that occur inside of
      // the i18n module.
      // TODO -- see if we still need this -- it was added to handle
      // crashes that occurred when no locale files could be found,
      // but the newer version of i18n might have fixed this issue.
      domain.create()

      // Catch
      .on('error', function(err) {
        sails.log.error(err);
      })

      // Try
      .run(function() {
        i18n.configure(_.defaults(sails.config.i18n, {
          cookie: null,
          directory: sails.config.appPath + sails.config.i18n.localesDirectory,
          updateFiles: false,
          extension: '.json',
          logDebugFn: function(log){sails.log.verbose('i18n:', log);},
          logWarnFn: function(log){sails.log.warn('i18n:', log);},
          logErrorFn: function(log){sails.log.error('i18n:', log);},
        }));

        // Expose global access to locale strings
        sails.__ = i18n.__;
      });

      // Finally
      cb();
    }

  };
};
