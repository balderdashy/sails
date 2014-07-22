module.exports = function(sails) {


  /**
   * Module dependencies
   */
  var buildDictionary = require('sails-build-dictionary');
  var async           = require('async');
  var path            = require('path');


  // TODO:
  // Look at improving `includeAll` to work asynchronously
  // CommonJS `require` is a blocking operation, and makes apps
  // start slower.



  /**
   * Module loader
   *
   * Load a module into memory
   */
  return {


    // Default configuration
    defaults: function(config) {

      // Enable server-side CoffeeScript support
      // TODO: only do this if a `.coffee` file is encountered
      // if (filepath.match(/\.coffee$/)) {}
      // TODO: if a coffee file is encountered, but coffeescript
      //       cannot be required, log a more useful error.
      try {
        require('coffee-script/register');
      } catch (e0) {
        try {
          var appPath = config.appPath || process.cwd();
          require(path.join(appPath, 'node_modules/coffee-script/register'));
        } catch (e1) {
          sails.log.verbose('Please run `npm install coffee-script` to use coffescript (skipping for now)');
          sails.log.silly('Here\'s the require error(s): ', e0, e1);
        }
      }

      return {

        // The path to the application
        appPath: config.appPath || process.cwd(),

        // Paths for application modules and key files
        // If `paths.app` not specified, use process.cwd()
        // (the directory where this Sails process is being initiated from)
        paths: {

          // Configuration
          //
          // For `userconfig` hook
          config: config.appPath + '/config',

          // Server-Side Code
          //
          // Plugins
          plugins: (config.plugins || []).map(function(m) {
            sails.log.debug("Loading plugin: " + m);
            return config.appPath + '/node_modules/' + m;
          }),
          // For `controllers` hook
          controllers: config.appPath + '/api/controllers',
          // For `policies` hook
          policies: config.appPath + '/api/policies',
          // For `services` hook
          services: config.appPath + '/api/services',
          // For `orm` hook
          adapters: config.appPath + '/api/adapters',
          models: config.appPath + '/api/models',
          // For `userhooks` hook
          hooks: config.appPath + '/api/hooks',
          // For `blueprints` hook
          blueprints: config.appPath + '/api/blueprints',
          // For `responses` hook
          responses: config.appPath + '/api/responses',

          // Server-Side HTML
          //
          // For `views` hook
          views: config.appPath + '/views',
          layout: config.appPath + '/views/layout.ejs',
        }
      };
    },


    initialize: function(cb) {

      // Expose self as `sails.modules` (for backwards compatibility)
      sails.modules = sails.hooks.moduleloader;

      return cb();
    },

    configure: function() {
      if (sails.config.moduleLoaderOverride) {
        var override = sails.config.moduleLoaderOverride(sails);
        sails.util.extend(this, override);
        if (override.configure) {
          this.configure();
        }
      }
    },



    /**
     * Load user config from app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadUserConfig: function(cb) {
      async.auto({
        'config/*': function loadOtherConfigFiles(cb) {
          buildDictionary.aggregate({
            dirname: sails.config.paths.config || sails.config.appPath + '/config',
            exclude: ['locales', 'local.js', 'local.json', 'local.coffee'],
            excludeDirs: ['locales'],
            filter: /(.+)\.(js|json|coffee)$/,
            identity: false
          }, cb);
        },

        'plugins/config/*': function loadOtherConfigFiles(cb) {
          var tasks = sails.config.paths.plugins.map(function(pluginPath) {
            buildDictionary.aggregate({
              dirname: pluginPath + '/config',
              exclude: ['locales', 'local.js', 'local.json', 'local.coffee'],
              excludeDirs: ['locales'],
              filter: /(.+)\.(js|json|coffee)$/,
              identity: false
            }, cb);
          });

          async.parallel(tasks, function(err, configs) {
            cb(err, sails.util.merge.apply(sails.util, configs) || {});
          });
        },

        'config/local': function loadLocalOverrideFile(cb) {
          buildDictionary.aggregate({
            dirname: sails.config.paths.config || sails.config.appPath + '/config',
            filter: /local\.(js|json|coffee)$/,
            identity: false
          }, cb);
        },

        'plugins/config/local': function loadOtherConfigFiles(cb) {
          var tasks = sails.config.paths.plugins.map(function(pluginPath) {
            buildDictionary.aggregate({
              dirname: sails.config.paths.config || sails.config.appPath + '/config',
              filter: /local\.(js|json|coffee)$/,
              identity: false
            }, cb);
          });

          async.parallel(tasks, function(err, configs) {
            cb(err, sails.util.merge.apply(sails.util, configs) || {});
          });
        }

      }, function(err, async_data) {
        if (err) return cb(err);

        // `local.js` overrides the other user config files.
        cb(null, sails.util.merge(
          async_data['config/*'],
          async_data['plugins/config/*'],
          async_data['config/local'],
          async_data['plugins/config/local']
        ));
      });
    },



    /**
     * Load app controllers
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadControllers: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.controllers,
            filter: /(.+)Controller\.(js|coffee)$/,
            flattenDirectories: true,
            keepDirectoryPath: true,
            replaceExpr: /Controller/
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/controllers',
                filter: /(.+)Controller\.(js|coffee)$/,
                flattenDirectories: true,
                keepDirectoryPath: true,
                replaceExpr: /Controller/
              }, c);
            };
          });

          async.parallel(tasks, function(err, controllers) {
            callback(err, sails.util.merge.apply(sails.util, controllers) || {});
          });
        }
      }, function(err, controllers) {
        cb(err, sails.util.merge(controllers.plugins, controllers.main));
      });
    },



    /**
     * Load app policies
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadPolicies: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.policies,
            filter: /(.+)\.(js|coffee)$/,
            replaceExpr: null,
            flattenDirectories: true,
            keepDirectoryPath: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/policies',
                filter: /(.+)\.(js|coffee)$/,
                depth: 1,
                caseSensitive: true
              }, c);
            };
          });
          async.parallel(tasks, function(err, policies) {
            callback(err, sails.util.merge.apply(sails.util, policies) || {});
          });
        }
      }, function(err, policies) {
        if (err)
          cb(err);
        cb(null, sails.util.merge(policies.plugins, policies.main));
      });
    },



    /**
     * Load app services
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadServices: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.services,
            filter: /(.+)\.(js|coffee)$/,
            depth: 1,
            caseSensitive: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/services',
                filter: /(.+)\.(js|coffee)$/,
                depth: 1,
                caseSensitive: true
              }, c);
            };
          });
          async.parallel(tasks, function(err, services) {
            callback(err, sails.util.merge.apply(sails.util, services) || {});
          });
        }
      }, function(err, services) {
        if (err)
          cb(err);
        else
          cb(null, sails.util.merge(services.plugins, services.main));
      });
    },



    /**
     * Load adapters
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadAdapters: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.adapters,
            filter: /(.+Adapter)\.(js|coffee)$/,
            replaceExpr: /Adapter/,
            flattenDirectories: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/adapters',
                filter: /(.+Adapter)\.(js|coffee)$/,
                replaceExpr: /Adapter/,
                flattenDirectories: true
              }, c);
            };
          });

          async.parallel(tasks, function(err, adapters) {
            callback(err, sails.util.merge.apply(sails.util, adapters) || {});
          });
        }
      }, function(err, adapters) {
        if (err)
          cb(err);
        else
          cb(null, sails.util.merge(adapters.plugins, adapters.main));
      });
    },


    /**
     * Load app's model definitions
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadModels: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.models,
            filter: /^([^.]+)\.(js|coffee)$/,
            replaceExpr: /^.*\//,
            flattenDirectories: true
          }, callback);
        },
        suppl: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.models,
            filter: /(.+)\.attributes.json$/,
            replaceExpr: /^.*\//,
            flattenDirectories: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/models',
                filter: /^([^.]+)\.(js|coffee)$/,
                replaceExpr: /^.*\//,
                flattenDirectories: true
              }, c);
            };
          });
          async.parallel(tasks, function(err, models) {
            callback(err, sails.util.merge.apply(sails.util, models) || {});
          });
        }
      }, function(err, models) {
        if (err)
          return cb(err);
        else
          return cb(null, sails.util.merge(
            // In order for low to high priority
            models.plugins,
            models.suppl,
            models.main
          ));
      });
    },



    /**
     * Load app hooks
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadUserHooks: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.hooks,
            filter: /^(.+)\.(js|coffee)$/,

            // Hooks should be defined as either single files as a function
            // OR (better yet) a subfolder with an index.js file
            // (like a standard node module)
            depth: 2
          }, cb);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/hooks',
                filter: /^(.+)\.(js|coffee)$/,
                depth: 2
              }, c);
            };
          });
          async.parallel(tasks, function(err, hooks) {
            callback(err, sails.util.merge.apply(sails.util, hooks) || {});
          });
        }
      }, function(err, hooks) {
        if (err)
          cb(err);
        else
          cb(null, hooks.plugins, sails.util.merge(hooks.main));
      });
    },



    /**
     * Load app blueprint middleware.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadBlueprints: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.blueprints,
            filter: /(.+)\.(js|coffee)$/,
            useGlobalIdForKeyName: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/blueprints',
                filter: /(.+)\.(js|coffee)$/,
                useGlobalIdForKeyName: true
              }, c);
            };
          });
          async.parallel(tasks, function(err, blueprints) {
            callback(err, sails.util.merge.apply(sails.util, blueprints) || {});
          });
        }
      }, function(err, blueprints) {
        if (err)
          cb(err);
        else
          cb(null, sails.util.merge(blueprints.plugins, blueprints.main));
      });
    },



    /**
     * Load custom API responses.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadResponses: function(cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname: sails.config.paths.responses,
            filter: /(.+)\.(js|coffee)$/,
            useGlobalIdForKeyName: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/api/responses',
                filter: /(.+)\.(js|coffee)$/,
                useGlobalIdForKeyName: true
              }, c);
            };
          });
          async.parallel(tasks, function(err, responses) {
            callback(err, sails.util.merge.apply(sails.util, responses) || {});
          });
        }
      }, function(err, responses) {
        if (err)
          cb(err);
        else
          cb(null, sails.util.merge(responses.plugins, responses.main));
      });
    },



    /**
     * Check for the existence of views in the app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    statViews: function(cb) {
      buildDictionary.optional({
        dirname: sails.config.paths.views,
        filter: /(.+)\..+$/,
        replaceExpr: null,
        dontLoad: true
      }, cb);
    },

    optional: buildDictionary.optional,
    required: buildDictionary.required,
    aggregate: buildDictionary.aggregate,
    exits: buildDictionary.exists
  };
};
