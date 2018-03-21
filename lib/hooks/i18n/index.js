module.exports = function(sails) {

  /**
   * Module dependencies.
   */

  var util = require('util');
  var path = require('path');
  var _ = require('@sailshq/lodash');
  var i18nFactory = require('i18n-2');


  // The file extension for locales files (e.g. in config/locales/)
  var I18N_LOCALES_FILE_EXTENSION = '.json';

  // Declare a var to hold the hook's singleton i18n instance.
  // (if we're unable to initialize this hook properly and we skip it,
  // then this will still be set to `undefined`)
  var i18n;

  // Hold the resolved absolute path to the configured locales dir.
  // (if we're unable to initialize this hook properly and we skip it,
  // then this will still be set to `undefined`)
  var resolvedLocalesDirectory;


  /**
   * Expose hook definition
   */

  return {

    defaults: {
      // i18n
      i18n: {
        locales: [],
        // ^^this is just the implicit default (is overridden by boilerplate settings in `config/i18n.js`)
        defaultLocale: 'en',
        localesDirectory: 'config/locales/'
      }
    },


    configure: function() {

      if (!_.isArray(sails.config.i18n.locales)) {
        throw new Error('`sails.config.i18n.locales` must be an array of strings like [\'en\', \'es\'], but instead got: '+util.inspect(sails.config.i18n.locales, {depth:null})+'');
      }

      if (!sails.config.i18n.localesDirectory || !_.isString(sails.config.i18n.localesDirectory)) {
        throw new Error('`sails.config.i18n.localesDirectory` must be a string like "config/locales/".  But, instead got: '+util.inspect(sails.config.i18n.localesDirectory, {depth:null})+'');
      }

      // If we have a default locale config, and it exists in the list of configured locales,
      // move it to the top of the list.  This is a workaround for https://github.com/jeresig/i18n-node-2/issues/90
      if (sails.config.i18n.defaultLocale && sails.config.i18n.locales && _.contains(sails.config.i18n.locales, sails.config.i18n.defaultLocale)) {
        sails.config.i18n.locales = [sails.config.i18n.defaultLocale].concat(_.without(sails.config.i18n.locales, sails.config.i18n.defaultLocale));
      }

    },

    initialize: function(cb) {

      var self = this;

      // If the array of locales is empty, then bail out now.
      // (There's nothing for us to do in this hook.)
      if (sails.config.i18n.locales.length === 0) {
        sails.log.verbose('Skipping i18n hook because configured locales (`sails.config.i18n.locales`) is an empty array.');

        // Delete sails.hooks.i18n so that checks like `if (sails.hooks.i18n)` come back falsey.
        delete sails.hooks.i18n;

        // Add __ and i18n functions that just pass through the string (and return a warning).
        sails.__ = sails.i18n = function(str) { sails.log.warn('i18n hook has disabled itself due to misconfiguration -- returning input string as-is.  Set `sails.config.i18n.locales` to activate i18n.');  return str; };
        // Add passthru __ and i18n to res.locals.
        sails.on('router:before', function () {
          sails.router.bind('all /*', function addLocalizationMethod (req, res, next) {
            res.locals.__ = res.locals.i18n = sails.__;
            return next();
          });

        });//</sails.on>

        return cb();
      }//-•

      // Determine the abs path to the locales dir, resolving relative from the appPath.
      // (supports absolute or relative path)
      resolvedLocalesDirectory = path.resolve(sails.config.appPath, sails.config.i18n.localesDirectory);

      // Override logger while initializing i18n-2, since it uses console function directly.
      // We'll just buffer any messages and replay them when i18n-2 is done (or fails) initializing.
      var logs = [];
      var warns = [];
      var errors = [];
      var origLog = console.log;
      var origWarn = console.warn;
      var origError = console.error;
      console.log = function() {logs.push(Array.prototype.slice.call(arguments));};
      console.warn = function() {warns.push(Array.prototype.slice.call(arguments));};
      console.error = function() {errors.push(Array.prototype.slice.call(arguments));};

      // Attempt to initialize i18n.  This will fail if there's no `config/locales` directory.
      try {

        i18n = new i18nFactory({
          locales: sails.config.i18n.locales,
          defaultLocale: sails.config.i18n.defaultLocale,
          directory: resolvedLocalesDirectory,
          extension: I18N_LOCALES_FILE_EXTENSION
        });

        // Add all of the i18n prototype methods into this hook.
        _.each(i18nFactory.prototype, function(val, key) {
          if (_.isFunction(val)) {
            self[key] = i18n[key].bind(i18n);
          }
        });

        // Expose global access to locale strings
        sails.__ = self.__;
        sails.i18n = self.__;

      }
      catch (e) {
        sails.log.error('Failed to initialize i18n hook.  (Tip: Does the ' + resolvedLocalesDirectory + ' directory exist?)');
        sails.log.error(e.stack);
        return cb(e);
      }

      // Restore the original console logger functions, and then
      // replay any logs that were generated while trying to init i18n-2.
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      _.each(logs, function(log) {sails.log.verbose.apply(this, log);});
      _.each(warns, function(warn) {sails.log.warn.apply(this, warn);});
      _.each(errors, function(error) {sails.log.error.apply(this, error);});



      // When Sails is ready to bind "before" shadow routes, bind a shadow route that
      // adds the localization methods and locals.
      sails.on('router:before', function (){
        sails.router.bind('all /*', function addLocalizationMethod (req, res, next) {
          return sails.hooks.i18n.expressMiddleware(req, res, next);
        });

      });//</sails.on>


      // Finally, call the callback to indicate that the hook is done initializing.
      return cb();

    },

    // Express middleware that adds translation capabilities (e.g. the __ function)
    // to the `res` object.  Useful mainly for doing internationalization in views.
    expressMiddleware: function (req, res, next) {

      // If we don't have res.locals, we don't have anything to mix i18n options onto.
      if (!res.locals) { return next(new Error('Provided `res` must contain `res.locals`.')); }

      // If we weren't able to initialize the singleton i18n module, then we
      // should never have made it here.
      if (!i18n) { return next(new Error('Consistency violation: This should never happen -- sails.hooks.i18n.expressMiddleware should never be available if i18n could not be initialized.')); }

      // Try to create a new i18n instance.  This is necessary because
      // locale is set on a per-instance basis, and the request header
      // may change the locale for a given instance (but we wouldn't
      // want it to change for the instance connected to `sails.__()` )
      try {
        req.i18n = new i18nFactory({
          locales: sails.config.i18n.locales,
          defaultLocale: sails.config.i18n.defaultLocale,
          directory: resolvedLocalesDirectory,
          extension: I18N_LOCALES_FILE_EXTENSION,
          request: req
        });

        // Mix translation capabilities into res.locals.
        i18nFactory.registerMethods(res.locals, req);

        // Add `setLocale()` method for convenience.
        // (This is documented and fully supported as of Sails v1.0 and beyond.)
        req.setLocale = req.i18n.setLocale.bind(req.i18n);

        // For backwards compatibility:
        //  • Add `i18n` method as alias to `__`
        //  • Add `getLocale()` method to `req`
        res.locals.i18n = res.locals.__;
        req.getLocale = req.i18n.getLocale.bind(req.i18n);

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
