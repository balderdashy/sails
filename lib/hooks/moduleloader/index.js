module.exports = function(sails) {


  /**
   * Module dependencies
   */

  var buildDictionary = require('sails-build-dictionary'),
    async = require('async'),
    path = require('path');


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
    defaults: function (config) {

      // Enable server-side CoffeeScript support
      // TODO: only do this if a `.coffee` file is encountered
      // if (filepath.match(/\.coffee$/)) {}
      // TODO: if a coffee file is encountered, but coffeescript
      //       cannot be required, log a more useful error.
      try {
        require('coffee-script/register');
      } catch(e0){
        try {
          var appPath = config.appPath || process.cwd();
          require(path.join(appPath, 'node_modules/coffee-script/register'));
        }
        catch (e1) {
          sails.log.verbose('Please run `npm install coffee-script` to use coffescript (skipping for now)');
          sails.log.silly('Here\'s the require error(s): ',e0,e1);
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
        var override = sails.config.moduleLoaderOverride(sails, this);
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
    loadUserConfig: function (cb) {

      async.auto({

        'config/*': function loadOtherConfigFiles (cb) {
          buildDictionary.aggregate({
            dirname   : sails.config.paths.config || sails.config.appPath + '/config',
            exclude   : ['locales', 'local.js', 'local.json', 'local.coffee'],
            excludeDirs: /(locales|env)$/,
            filter    : /(.+)\.(js|json|coffee)$/,
            identity  : false
          }, cb);
        },


        'config/local' : function loadLocalOverrideFile (cb) {
          buildDictionary.aggregate({
            dirname   : sails.config.paths.config || sails.config.appPath + '/config',
            filter    : /local\.(js|json|coffee)$/,
            identity  : false
          }, cb);
        },


        'config/env/*' : ['config/local', function loadLocalOverrideFile (cb, async_data) {
          // If there's an environment already set in sails.config, then it came from the environment
          // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
          // for an environment setting.  Lastly, default to development.
          var env = sails.config.environment || async_data['config/local'].environment || 'development';
          buildDictionary.aggregate({
            dirname   : (sails.config.paths.config || sails.config.appPath + '/config') + '/env',
            filter    : new RegExp(env + '.(js|json|coffee)$'),
            optional  : true,
            identity  : false
          }, cb);
        }]

      }, function (err, async_data) {
        if (err) return cb(err);
        // Save the environment override, if any.
        var env = sails.config.environment;
        // Merge the configs, with local.js taking precedence over others, and env/*.js files
        // taking precedence over local.js
        var config = sails.util.merge(
          async_data['config/*'],
          async_data['config/local'],
          async_data['config/env/*']
        );
        // Set the environment.
        config.environment = env || config.environment || 'development';
        // Return the user config
        cb(null, config);
      });
    },



    /**
     * Load app controllers
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadControllers: function (cb) {
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
                dirname: m + '/controllers',
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
     * Load adapters
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadAdapters: function (cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname   : sails.config.paths.adapters,
            filter    : /(.+Adapter)\.(js|coffee)$/,
            replaceExpr : /Adapter/,
            flattenDirectories: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname: m + '/adapters',
                filter    : /(.+Adapter)\.(js|coffee)$/,
                replaceExpr : /Adapter/,
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
          cb(err)
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
    loadModels: function (cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname   : sails.config.paths.models,
            filter    : /^([^.]+)\.(js|coffee)$/,
            replaceExpr : /^.*\//,
            flattenDirectories: true
          }, callback);
        },
        suppl: function(callback) {
          buildDictionary.optional({
            dirname   : sails.config.paths.models,
            filter    : /(.+)\.attributes.json$/,
            replaceExpr : /^.*\//,
            flattenDirectories: true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname   : m + '/models',
                filter    : /^([^.]+)\.(js|coffee)$/,
                replaceExpr : /^.*\//,
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

            // In order, we want the main files to override the modules' ones.
            models.plugins,
            models.suppl,
            models.main
          ));
      });
    },





    /**
     * Load app services
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadServices: function (cb) {
      async.parallel({
        main: function(callback) {
          buildDictionary.optional({
            dirname     : sails.config.paths.services,
            filter      : /(.+)\.(js|coffee)$/,
            depth     : 1,
            caseSensitive : true
          }, callback);
        },
        plugins: function(callback) {
          var tasks = sails.config.paths.plugins.map(function(m) {
            return function(c) {
              buildDictionary.optional({
                dirname   : m + '/services',
                filter      : /(.+)\.(js|coffee)$/,
                depth     : 1,
                caseSensitive : true
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
     * Check for the existence of views in the app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    statViews: function (cb) {
      buildDictionary.optional({
        dirname: sails.config.paths.views,
        filter: /(.+)\..+$/,
        replaceExpr: null,
        dontLoad: true
      }, cb);
    },



    /**
     * Load app policies
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadPolicies: function (cb) {
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
                dirname   : m + '/policies',
                filter      : /(.+)\.(js|coffee)$/,
                depth     : 1,
                caseSensitive : true
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
     * Load app hooks
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadUserHooks: function (cb) {
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
                dirname   : m + '/hooks',
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
          cb(null, sails.util.merge(hooks.plugins, hooks.main));
      });
    },



    /**
     * Load app blueprint middleware.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadBlueprints: function (cb) {
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
                dirname   : m + '/blueprints',
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
    loadResponses: function (cb) {
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
                dirname   : m + '/responses',
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

    optional: buildDictionary.optional,
    required: buildDictionary.required,
    aggregate: buildDictionary.aggregate,
    exits: buildDictionary.exists

  };

};
