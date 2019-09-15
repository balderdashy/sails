/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var _ = require('@sailshq/lodash');
var async = require('async');
var CaptainsLog = require('captains-log');
var mergeDictionaries = require('merge-dictionaries');


module.exports = function(sails) {

  /**
   * Expose Configuration loader
   *
   * Load command-line overrides
   *
   * FUTURE: consider merging this into the `app` directory
   *
   * For reference, config priority is:
   * --> implicit defaults
   * --> environment variables
   * --> user config files
   * --> local config file
   * --> configOverride ( in call to sails.lift() )
   * --> --cmdline args
   */

  return function loadConfig(cb) {

    // Save reference to context for use in closures
    var self = this;

    // Commence with loading/validating/defaulting all the rest of the config
    async.auto({

      /**
       * Until this point, `sails.config` is composed only of
       * configuration overrides passed into `sails.lift(overrides)`
       * (or `sails.load(overrides)`-- same thing)
       *
       * This step clones this into an "overrides" object, negotiating cmdline
       * shortcuts into the properly namespaced sails configuration options.
       */
      mapOverrides: function(cb) {

        // Clone the `overrides` that were passed in.
        // TODO -- since this code is only called as a result of `sails.load()`, which already
        //         clones the overrides, is this clone necessary?
        var overrides = _.clone(sails.config || {});

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: Try bringing the rconf stuff from bin/sails-lift in here
        // (that way, we don't have to rely on duplicate code in app.js and in bin/sails-lift.js)
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


        // Map Sails options from overrides, handling a few special "shortcuts"
        // (i.e. allowing for CLI arguments like `--verbose`, instead of `--log.level=verbose`)
        try {
          overrides = _.merge(overrides, {

            // `--verbose` command-line shortcut
            // `--silly` command-line shortcut
            // `--silent` command-line shortcut
            log: overrides.verbose ? {
              level: 'verbose'
            } : overrides.silly ? {
              level: 'silly'
            } : overrides.silent ? {
              level: 'silent'
            } : undefined,

            // `--port=?` command-line shortcut
            port: overrides.port || undefined,

            // `--safe` command-line shortcut
            // `--alter` command-line shortcut
            // `--drop` command-line shortcut
            models: (function(){
              if (overrides.safe) {
                return { migrate: 'safe' };
              }
              else if (overrides.drop) {
                return { migrate: 'drop' };
              }
              else if (overrides.alter) {
                return { migrate: 'alter' };
              }
              else {
                return undefined;
              }
            })(),

            // `--redis` command-line shortcut
            session: (function(){
              if (overrides.redis) {
                return { adapter: '@sailshq/connect-redis' };
              }
              return undefined;
            })(),
            sockets: (function(){
              if (overrides.redis) {
                return { adapter: '@sailshq/socket.io-redis' };
              }
              return undefined;
            })(),

            // `--prod` command-line shortcut
            // `--staging` command-line shortcut
            // `--dev` command-line shortcut
            environment: (function(){
              if (overrides.staging) {// --staging
                return 'staging';
              } else if (overrides.prod){// --prod  (but it's cleaner to use NODE_ENV=production with no other environment instead)
                return 'production';
              } else if (overrides.dev) {// --dev  (deprecated)
                console.warn('`--dev` option is deprecated: Please do not use it.');
                // Note: we use `console.warn` here because we're not guaranteed
                // to have a working logger yet.
                return 'development';
              } else {
                return undefined;
              }
            })()//†

          });

        } catch (e) { return cb(e); }

        // Pass on overrides object
        return cb(undefined, overrides);
      },



      /**
       * Immediately instantiate the default logger in case a log-worthy event occurs
       * Even though the app might actually use its own custom logger, we don't know
       * all of the user configurations yet.
       *
       * Makes sails.log accessible for the first time
       */
      logger: ['mapOverrides',
        function(asyncData, cb) {
          var logConfigSoFar = asyncData.mapOverrides.log;
          sails.log = new CaptainsLog(logConfigSoFar);
          cb();
        }
      ],


      /**
       * Expose version/dependency info for the currently-running
       * Sails on the `sails` object (from its `package.json`)
       */
      versionAndDependencyInfo: function(cb) {

        var pathToThisVersionOfSails = path.join(__dirname, '../../..');
        var json;
        try {
          json = JSON.parse(fs.readFileSync(path.resolve(pathToThisVersionOfSails, 'package.json'), 'utf8'));
        } catch (e) {
          return cb(e);
        }
        sails.version = json.version;
        sails.majorVersion = sails.version.split('.')[0].replace(/[^0-9]/g, '');
        sails.minorVersion = sails.version.split('.')[1].replace(/[^0-9]/g, '');
        sails.patchVersion = sails.version.split('.')[2].replace(/[^0-9]/g, '');
        sails.dependencies = json.dependencies;

        cb();
      },


      /**
       * Ensure that environment variables are applied to important configs
       */
      mixinDefaults: ['mapOverrides',
        function(results, cb) {

          // Get overrides
          var overrides = results.mapOverrides;

          // Apply environment variables
          // (if the config values are not set in overrides)
          overrides.environment = overrides.environment || process.env.NODE_ENV;
          overrides.port = overrides.port || process.env.PORT;

          // Generate implicit, built-in framework defaults for the app
          var implicitDefaults = self.defaults(overrides.appPath || process.cwd());

          // Extend copy of implicit defaults with user config
          // TODO -- is the _.clone() necessary?
          var mergedConfig = mergeDictionaries(_.clone(implicitDefaults), overrides);
          return cb(undefined, mergedConfig);
        }
      ]

    },


    function configLoaded(err, results) {
      if (err) {
        sails.log.error('Error encountered loading config ::\n', err);
        return cb(err);
      }

      // Override the previous contents of sails.config with the new, validated
      // config w/ defaults and overrides mixed in the appropriate order.
      sails.config = results.mixinDefaults;

      return cb();
    });
  };

};
