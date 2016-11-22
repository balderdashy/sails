module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var _ = require('@sailshq/lodash');
  var i18nFactory = require('i18n-2');

  // Declare a var to hold the hook's singleton i18n instance.
  var i18n;

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

          return sails.hooks.i18n.expressMiddleware(req, res, next);

        }
      }
    },

    configure: function() {

      // If we have a default locale config, and it exists in the list of configured locales,
      // move it to the top of the list.  This is a workaround for https://github.com/jeresig/i18n-node-2/issues/90
      if (sails.config.i18n.defaultLocale && sails.config.i18n.locales && _.contains(sails.config.i18n.locales, sails.config.i18n.defaultLocale)) {
        sails.config.i18n.locales = [sails.config.i18n.defaultLocale].concat(_.without(sails.config.i18n.locales, sails.config.i18n.defaultLocale));
      }

    },

    initialize: function(cb) {

      var self = this;

      // Override logger while initializing i18n-2, since it uses console function directly.
      // We'll just buffer any messages and replay them when i18n-2 is done (or fails) initializing.
      var logs = [], warns = [], errors = [];
      var origLog = console.log;
      var origWarn = console.warn;
      var origError = console.error;
      console.log = function() {logs.push(Array.prototype.slice.call(arguments));};
      console.warn = function() {warns.push(Array.prototype.slice.call(arguments));};
      console.error = function() {errors.push(Array.prototype.slice.call(arguments));};

      // Attempt to initialize i18n.  This will fail if there's no `config/locales` directory.
      try {
        i18n = (new i18nFactory(_.defaults(sails.config.i18n, {
          locales: ['en', 'de'],
          directory: sails.config.appPath + sails.config.i18n.localesDirectory,
          defaultLocale: 'en',
          extension: '.json'
        })));
        // Add all of the i18n prototype methods into this hook.
        _.each(i18nFactory.prototype, function(val, key) {
          if (_.isFunction(val)) {
            self[key] = i18n[key].bind(i18n);
          }
        });

        // Expose global access to locale strings
        sails.__ = this.__;

      }
      catch (e) {
        sails.log.error('Failed to initialize i18n hook. Does the ' + sails.config.appPath + sails.config.i18n.localesDirectory + ' directory exist?');
      }

      // Restore the original console logger functions, and then
      // replay any logs that were generated while trying to init i18n-2.
      finally {
        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
        _.each(logs, function(log) {sails.log.verbose.apply(this, log);});
        _.each(warns, function(warn) {sails.log.warn.apply(this, warn);});
        _.each(errors, function(error) {sails.log.error.apply(this, error);});

        // Finally, call the callback to indicate that the hook is done initializing.
        return cb();
      }

    },

    // Express middleware that adds translation capabilities (e.g. the __ function)
    // to the `res` object.  Useful mainly for doing internationalization in views.
    expressMiddleware: function (req, res, next) {

      // If we weren't able to initialize the singleton i18n module, leave early.
      if (!i18n) {return next();}

      // Likewise if we don't have res.locals, since that's what we're trying to
      // mix i18n options onto.
      if (!res.locals) {return next();}

      // Use the sails.config.i18n options when creating the new i18n instance.
      var options = _.defaults(sails.config.i18n, {
        locales: ['en', 'de'],
        directory: sails.config.appPath + sails.config.i18n.localesDirectory,
        defaultLocale: 'en',
        extension: '.json'
      });
      // Mix in the request.
      options.request = req;

      // Try to create a new i18n instance.  This is necessary because
      // locale is set on a per-instance basis, and the request header
      // may change the locale for a given instance (but we wouldn't
      // want it to change for the instance connected to `sails.__()` )
      try {
        req.i18n = new i18nFactory(options);
        // Mix translation capabilities into res.locals.
        i18nFactory.registerMethods(res.locals, req);
      } catch (e) {
        // Seeing as we have a valid i18n singleton already, the
        // initialization failing now seems more serious, but we
        // still don't want to crash because of it.
        // We should at least log the error though.
        sails.log.error('Error attaching i18n to response:');
        sails.log.error(e);
      }

      // Continue processing the request.
      return next();

    },

  };
};
