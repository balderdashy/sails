/**
 * Module dependencies.
 */

var _ = require('lodash');
var async = require('async');
var CaptainsLog = require('captains-log');
var path = require('path');


module.exports = function(sails) {

  /**
   * Expose Configuration loader
   *
   * Load command-line overrides
   *
   * TODO: consider merging this into the `app` directory
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
         * Until this point this point, `sails.config` is composed only of
         * configuration overrides passed into `sails.lift(overrides)`
         * (or `sails.load(overrides)`-- same thing)
         *
         * This step clones this into an "overrides" object, negotiating cmdline
         * shortcuts into the properly namespced sails configuration options.
         */
        mapOverrides: function(cb) {

          // Clone the `overrides` that were passed in.
          var overrides = _.cloneDeep(sails.config || {});

          // TODO: bring the rconf stuff from bin/sails-lift in here

          // Command-line arguments take highest precedence
          // overrides = _.merge(overrides, argv);

          // Map Sails options from overrides
          overrides = _.merge(overrides, {

            // `--verbose` command-line argument
            // `--silly` command-line argument
            // `--silent` command-line argument
            log: overrides.verbose ? {
              level: 'verbose'
            } : overrides.silly ? {
              level: 'silly'
            } : overrides.silent ? {
              level: 'silent'
            } : undefined,

            // `--port=?` command-line argument
            port: overrides.port || undefined,

            // `--prod` command-line argument
            environment: overrides.prod ? 'production' : (overrides.dev ? 'development' : undefined)

          });


          // Pass on overrides object
          cb(null, overrides);
        },



        /**
         * Immediately instantiate the default logger in case a log-worthy event occurs
         * Even though the app might actually use its own custom logger, we don't know
         * all of the user configurations yet.
         *
         * Makes sails.log accessible for the first time
         */
        logger: ['mapOverrides',
          function(cb, async_data) {
            var logConfigSoFar = async_data.mapOverrides.log;
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
          sails.util.getPackage(pathToThisVersionOfSails, function(err, json) {
            if (err) return cb(err);

            sails.version = json.version;
            sails.majorVersion = sails.version.split('.')[0].replace(/[^0-9]/g, '');
            sails.minorVersion = sails.version.split('.')[1].replace(/[^0-9]/g, '');
            sails.patchVersion = sails.version.split('.')[2].replace(/[^0-9]/g, '');
            sails.dependencies = json.dependencies;

            cb();
          });
        },


        /**
         * Ensure that environment variables are applied to important configs
         */
        mixinDefaults: ['mapOverrides',
          function(cb, results) {

            // Get overrides
            var overrides = results.mapOverrides; //_.cloneDeep(results.mapOverrides);

            // Apply environment variables
            // (if the config values are not set in overrides)
            overrides.environment = overrides.environment || process.env.NODE_ENV;
            overrides.port = overrides.port || process.env.PORT;

            // Generate implicit, built-in framework defaults for the app
            var implicitDefaults = self.defaults(overrides.appPath || process.cwd());

            // Extend copy of implicit defaults with user config
            var mergedConfig = _.merge(_.cloneDeep(implicitDefaults), overrides);


            // Set the NODE_ENV environment variable so express and other modules
            // which expect NODE_ENV to be set mirror the configured Sails environment
            // setting (i.e. `sails.config.environment`).
            //
            // Note:
            // Setting an environment var explicitly to "undefined" sets it to the
            // *string* "undefined".  So we only bother setting it if it is truthy.
            sails.log.verbose('Setting Node environment...');
            if (mergedConfig.environment) {
              // If we end up setting NODE_ENV, we first save the original value of NODE_ENV
              // as `sails._originalNodeEnv`, so that we can potentially revert to it when
              // lowering the app.  This way if a Sails app is loaded subsequently in the same
              // process (e.g. tests), it does not end up using an unexpected environment due
              // to NODE_ENV being set from previous lifts/loads. See the implementation of
              // `.lower()` for further explanation.
              sails._originalNodeEnv = process.env['NODE_ENV'];
              // Note that we also set a flag indicating that we set the `NODE_ENV` at all.
              // (we could just compare the current NODE_ENV with _originalNodeEnv in `.lower()`,
              //  but it's not guaranteed to be accurate, since NODE_ENV could have been set again
              //  for some reason at runtime; e.g. multiple test apps lifting/lowering/popping/locking)
              sails._setNodeEnvAutomatically = true;
              process.env['NODE_ENV'] = mergedConfig.environment;
            }

            cb(null, mergedConfig);
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

        cb();
      });
  };

};
