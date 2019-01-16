module.exports = function(sails) {

  /**
   * Module dependencies
   */
  var path = require('path');
  var fs = require('fs');
  var async = require('async');
  var _ = require('@sailshq/lodash');
  var includeAll = require('include-all');
  var mergeDictionaries = require('merge-dictionaries');
  var COMMON_JS_FILE_EXTENSIONS = require('common-js-file-extensions');


  /**
   * Module constants
   */

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Supported file extensions for imperative code files such as hooks:
  //  • 'js' (.js)
  //  • 'ts' (.ts)
  //  • 'es6' (.es6)
  //  • ...etc.
  //
  // > For full list, see:
  // > https://github.com/luislobo/common-js-file-extensions/blob/210fd15d89690c7aaa35dba35478cb91c693dfa8/README.md#code-file-extensions
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var BASIC_SUPPORTED_FILE_EXTENSIONS = COMMON_JS_FILE_EXTENSIONS.code;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Supported file extensions, ONLY for configuration files:
  //  • All of the normal supported extensions like 'js', plus
  //  • 'json' (.json)
  //  • 'json5' (.json5)
  //  • 'json.ls' (.json.ls)
  //  • ...etc.
  //
  // > For full list, see:
  // > https://github.com/luislobo/common-js-file-extensions/blob/210fd15d89690c7aaa35dba35478cb91c693dfa8/README.md#configobject-file-extensions
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  var SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG = COMMON_JS_FILE_EXTENSIONS.config.concat(BASIC_SUPPORTED_FILE_EXTENSIONS);


  /**
   * Module loader
   *
   * Load code files from a Sails app into memory; modules like controllers,
   * models, services, config, etc.
   */
  return {


    defaults: function (config) {

      var localConfig = {

        // The path to the application
        appPath: config.appPath ? path.resolve(config.appPath) : process.cwd(),

        // Paths for application modules and key files
        // If `paths.app` not specified, use process.cwd()
        // (the directory where this Sails process is being initiated from)
        paths: {

          // Configuration
          //
          // For `userconfig` hook
          config: path.resolve(config.appPath, 'config'),

          // Server-Side Code
          //
          // For `controllers` hook
          controllers: path.resolve(config.appPath, 'api/controllers'),
          // For `policies` hook
          policies: path.resolve(config.appPath, 'api/policies'),
          // For `services` hook
          services: path.resolve(config.appPath, 'api/services'),
          // For `orm` hook
          adapters: path.resolve(config.appPath, 'api/adapters'),
          models: path.resolve(config.appPath, 'api/models'),
          // For `userhooks` hook
          hooks: path.resolve(config.appPath, 'api/hooks'),
          // For `blueprints` hook
          blueprints: path.resolve(config.appPath, 'api/blueprints'),
          // For `responses` hook
          responses: path.resolve(config.appPath, 'api/responses'),
          // For `helpers` hook
          helpers: path.resolve(config.appPath, 'api/helpers'),

          // Server-Side View templates
          //
          // For `views` hook
          views: path.resolve(config.appPath, 'views'),
          layout: path.resolve(config.appPath, 'views/layout.ejs')
        }

      };

      return localConfig;
    },

    initialize: function(cb) {
      // Expose self as `sails.modules`.
      sails.modules = sails.hooks.moduleloader;
      // |
      // |_Note that, in the future, the moduleloader's methods will be federated
      // | out to the places where they're being used, instead of relying on
      // | having those other modules call the appropriate method on `sails.modules.*()`.

      return cb();
    },

    configure: function() {

      // Default to process.cwd()
      sails.config.appPath = sails.config.appPath ? path.resolve(sails.config.appPath) : process.cwd();

      _.extend(sails.config.paths, {

        // Configuration
        //
        // For `userconfig` hook
        config: path.resolve(sails.config.appPath, sails.config.paths.config),

        // Server-Side Code
        //
        // For `controllers` hook
        controllers: path.resolve(sails.config.appPath, sails.config.paths.controllers),
        // For `policies` hook
        policies: path.resolve(sails.config.appPath, sails.config.paths.policies),
        // For `services` hook
        services: path.resolve(sails.config.appPath, sails.config.paths.services),
        // For `orm` hook
        adapters: path.resolve(sails.config.appPath, sails.config.paths.adapters),
        models: path.resolve(sails.config.appPath, sails.config.paths.models),
        // For `userhooks` hook
        hooks: path.resolve(sails.config.appPath, sails.config.paths.hooks),
        // For `blueprints` hook
        blueprints: path.resolve(sails.config.appPath, sails.config.paths.blueprints),
        // For `responses` hook
        responses: path.resolve(sails.config.appPath, sails.config.paths.responses),

        // Server-Side HTML
        //
        // For `views` hook
        views: path.resolve(sails.config.appPath, sails.config.paths.views),
        layout: path.resolve(sails.config.appPath, sails.config.paths.layout)
      });
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
          includeAll.aggregate({
            dirname   : sails.config.paths.config,
            exclude   : ['locales', /local\..+/],
            excludeDirs: /(locales|env)$/,
            filter    : new RegExp('^(.+)\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            flatten   : true,
            keepDirectoryPath: true,
            identity  : false
          }, cb);
        },

        'config/local' : function loadLocalOverrideFile (cb) {
          includeAll.aggregate({
            dirname   : sails.config.paths.config,
            filter    : new RegExp('^local\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            identity  : false
          }, cb);
        },

        // Load environment-specific config folder, e.g. config/env/development/*
        'config/env/**': ['config/local', function loadEnvConfigFolder (asyncData, cb) {
          // If there's an environment already set in sails.config, then it came from the environment
          // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
          // for an environment setting.  Lastly, default to development.
          var env = sails.config.environment || asyncData['config/local'].environment || 'development';
          includeAll.aggregate({
            dirname   : path.resolve( sails.config.paths.config, 'env', env ),
            filter    : new RegExp('^(.+)\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            optional  : true,
            flatten   : true,
            keepDirectoryPath: true,
            identity  : false
          }, cb);
        }],

        // Load environment-specific config file, e.g. config/env/development.js
        'config/env/*' : ['config/local', function loadEnvConfigFile (asyncData, cb) {
          // If there's an environment already set in sails.config, then it came from the environment
          // or the command line, so that takes precedence.  Otherwise, check the config/local.js file
          // for an environment setting.  Lastly, default to development.
          var env = sails.config.environment || asyncData['config/local'].environment || 'development';
          includeAll.aggregate({
            dirname   : path.resolve( sails.config.paths.config, 'env' ),
            filter    : new RegExp('^' + _.escapeRegExp(env) + '\\.(' + SUPPORTED_FILE_EXTENSIONS_FOR_CONFIG.join('|') + ')$'),
            optional  : true,
            flatten   : true,
            keepDirectoryPath: true,
            identity  : false
          }, cb);
        }]

      }, function (err, asyncData) {
        if (err) { return cb(err); }
        // Save the environment override, if any.
        var env = sails.config.environment;
        // Merge the configs, with env/*.js files taking precedence over others, and local.js
        // taking precedence over everything.
        var config = mergeDictionaries(
          asyncData['config/*'],
          asyncData['config/env/**'],
          asyncData['config/env/*'],
          asyncData['config/local']
        );
        // Set the environment, but don't allow env/* files to change it; that'd be weird.
        config.environment = env || asyncData['config/local'].environment || 'development';
        // Return the user config
        cb(undefined, config);
      });
    },

    /**
     * Load adapters
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadAdapters: function (cb) {

      // Load things like `api/adapters/FooAdapter.js`
      includeAll.optional({
        dirname: sails.config.paths.adapters,
        filter: /^(.+Adapter)\..+$/,
        replaceExpr: /Adapter/,
        flatten: true,
        depth: 1
      }, function(err, classicStyleAdapters) {
        if (err) {
          return cb(err);
        }

        // Load things like `api/adapters/foo/index.js`
        fs.readdir(sails.config.paths.adapters, function(err, contents) {
          if (err) {
            if (err.code === 'ENOENT') {
              return cb(undefined, classicStyleAdapters);
            }
            return cb(err);
          }

          var folderStyleAdapters = {};
          try {
            _.each(contents, function(filename) {

              var absPath = path.join(sails.config.paths.adapters, filename);

              // Exclude things that aren't directories, and directories that start with dots.
              if (_.startsWith(filename, '.')) {
                return;
              }
              var stats = fs.statSync(absPath);
              if (!stats.isDirectory()) {
                return;
              }

              // But otherwise, if we see a directory in here, try to require it.
              // (this follows the rules of the package.json file if there is one--
              //  or otherwise uses index.js by convention)
              var adapterDef = require(absPath);

              // Use the name of the folder as the identity.
              folderStyleAdapters[filename] = adapterDef;

            }); //</_.each()>
          } catch (e) {
            return cb(e);
          }

          // Finally, send back the merged-together set of adapters.
          return cb(undefined, _.extend(classicStyleAdapters, folderStyleAdapters));

        }); //</fs.readdir>
      }); //</includeall.optional>
    },

    /**
     * Load app's model definitions
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadModels: function (cb) {
      // Get the main model files
      includeAll.optional({
        dirname   : sails.config.paths.models,
        filter    : /^(.+)\.(?:(?!md|txt).)+$/,
        replaceExpr : /^.*\//,
        flatten: true
      }, function(err, models) {
        if (err) { return cb(err); }

        // ---------------------------------------------------------
        // Get any supplemental files (BACKWARDS-COMPAT.)
        includeAll.optional({
          dirname   : sails.config.paths.models,
          filter    : /(.+)\.attributes.json$/,
          replaceExpr : /^.*\//,
          flatten: true
        }, bindToSails(function(err, supplements) {
          if (err) { return cb(err); }

          if (_.keys(supplements).length > 0) {
            sails.log.debug('The use of `.attributes.json` files is deprecated, and support will be removed in a future release of Sails.');
          }

          return cb(undefined, _.merge(models, supplements));
        }));
        // ---------------------------------------------------------
      });
    },

    /**
     * Load app services
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadServices: function (cb) {
      includeAll.optional({
        dirname     : sails.config.paths.services,
        filter      : /^(.+)\.(?:(?!md|txt).)+$/,
        depth     : 1,
        caseSensitive : true
      }, bindToSails(cb));
    },

    /**
     * Check for the existence of views in the app
     *
     * @param {Object} options
     * @param {Function} cb
     */
    statViews: function (cb) {
      includeAll.optional({
        dirname: sails.config.paths.views,
        filter: /^(.+)\.(?:(?!md|txt).)+$/,
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
      includeAll.optional({
        dirname: sails.config.paths.policies,
        filter: /^(.+)\.(?:(?!md|txt).)+$/,
        replaceExpr: null,
        flatten: true,
        keepDirectoryPath: true
      }, bindToSails(cb));
    },

    /**
     * Load app hooks
     *
     * > Note that, while `sails.config.hooks` is respected here in this
     * > function, the `sails.config.loadHooks` setting in regards to
     * > user hooks is taken care of in the initialize() method of the
     * > userhooks hook itself.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadUserHooks: function (cb) {

      var defaultInstalledHooks = _.filter(_.values(require('../../app/configuration/default-hooks')), function(val) {return val !== true;});

      // Get the current app's package.json file (defaulting to an empty dictionary)
      var appPackageJson;
      try {
        appPackageJson = require(path.resolve(sails.config.appPath, 'package.json'));
      } catch (unusedErr) {
        appPackageJson = {};
      }

      async.auto({
        // Load user hooks from the "api/hooks" folder
        hooksFolder: function(cb) {
          includeAll.optional({
            dirname: sails.config.paths.hooks,
            filter: new RegExp('^(.+)\\.(' + BASIC_SUPPORTED_FILE_EXTENSIONS.join('|') + ')$'),

            // Hooks should be defined as either single files as a function
            // OR (better yet) a subfolder with an index.js file
            // (like a standard node module)
            depth: 2
          }, cb);
        },

        // Load package.json files from node_modules to check for hooks
        nodeModulesFolder: function(cb) {
          includeAll.optional({
            dirname: path.resolve(sails.config.appPath, 'node_modules'),
            filter: /^(package\.json)$/,
            excludeDirs: /^\./,
            // Look inside namespaced folders e.g. node_modules/@sailsjs/sails-hook-foo
            depth: 3,
            // Don't actually load the files, since malformed ones would cause a crash.
            // Just keep track of where they are and we'll load them carefully below.
            dontLoad: true
          }, function(err, modules) {
            if (err) { return cb(err); }

            // Now that we have a map of where the package.json files are, flatten that
            // map and load the files carefully.  Map might look something like:
            // { angular2:
            //    { animate: {},
            //      bundles: { web_worker: undefined },
            //      es6: { dev: undefined, prod: undefined },
            //      examples: { router: undefined },
            //      http: {},
            //      'package.json': true,
            //      etc...
            modules = (function _flatten(modules, installedHooks, currentPath, level) {
              installedHooks = installedHooks || {};
              currentPath = currentPath || '';
              level = level || 0;
              // Loop through the keys in the current map object
              Object.keys(modules).forEach(function(identity) {
                // If it represents a package.json file, attempt to load it and, if
                // successful, save it in our set of found files.  If unsuccessful,
                // just ignore it.
                if (identity === 'package.json' && modules[identity] === true) {
                  var filePath = path.resolve(sails.config.appPath, 'node_modules', currentPath, identity);
                  try {
                    // Attempt to load the package.json file
                    var packageJson = require(filePath);
                    // If the module isn't declared as a Sails hook, ignore it.
                    if (!packageJson.sails || !packageJson.sails.isHook) {
                      return;
                    }
                    // If the module isn't saved in this app's package.json, ignore it.
                    if (!_.get(appPackageJson, 'dependencies.' + packageJson.name) && !_.get(appPackageJson, 'devDependencies.' + packageJson.name) && !_.get(appPackageJson, 'optionalDependencies.' + packageJson.name)) {
                      sails.log.debug('Ignoring hook `' + packageJson.name + '` because it isn\'t saved as any kind of dependency in your package.json file.');
                      sails.log.debug('(You could try installing it with `npm install ' + packageJson.name +' --save`.  Or if you aren\'t using this hook,');
                      sails.log.debug('just remove it from the node_modules/ folder and this message will stop appearing.)');
                      sails.log.debug();
                      return;
                    }

                    // If it's one of our default hooks, ignore it so that it can be safely overridden.
                    if (_.contains(defaultInstalledHooks, packageJson.name)) {
                      return;
                    }
                    // Save a reference to this installed hook, which we'll use to require
                    // the full module below.
                    installedHooks[currentPath] = packageJson;
                  } catch(e) {
                    sails.log.verbose('While searching for installable hooks, found invalid package.json file at `'+filePath+'`.  Details:',e.stack);
                    return;
                  }
                }
                // If the key represents an object, recursively search within it, but only if it's directly
                // under node_modules or under a node_modules/@something (namespaced) folder
                if (_.isObject(modules[identity]) && level === 0 || (level === 1 && currentPath[0] === '@')) {
                  var nextPath;
                  if (currentPath) { nextPath = path.join(currentPath,identity); }
                  else { nextPath = identity; }

                  _flatten(modules[identity], installedHooks, nextPath, level + 1 );
                }
              });//</forEach() :: key in `modules`>

              // Return the dictionary of installed hooks we found.
              return installedHooks;
            })(modules);//</ invoked self-calling recursive function :: _flatten()>

            return cb(undefined, modules);
          });//</includeAll.optional() :: loading package.json files from the node_modules folder to check for hooks>
        }
      }, function(err, results) {
        if (err) {return cb(err);}

        // Marshall the hooks by checking that they are valid.  The ones from the
        // api/hooks folder are assumed to be okay, as long as they aren't explicitly turned off.
        var hooks = _.reduce(results.hooksFolder, function(memo, module, identity) {
          if (sails.config.hooks[identity] !== false && sails.config.hooks[identity] !== 'false') {
            memo[identity] = module;
          }
          return memo;
        }, {});

        try {

          // Loop through the package.json files of the hooks we found in the node_modules folder.
          _.extend(hooks, _.reduce(results.nodeModulesFolder, function(memo, modulePackageJson, identity) {

            // Any special config for this hook will be under the `sails` key in the package.json file.
            var hookConfig = modulePackageJson.sails;

            // Determine the name the hook should be added as
            var hookName;

            if (!_.isEmpty(hookConfig.hookName)) {
              hookName = hookConfig.hookName;
            }
            // If an identity was specified in sails.config.installedHooks, use that
            else if (sails.config.installedHooks && sails.config.installedHooks[identity] && sails.config.installedHooks[identity].name) {
              hookName = sails.config.installedHooks[identity].name;
            }
            // Otherwise use the module name, with namespacing and initial "sails-hook-" stripped off if it exists
            else {
              // Strip off any NPM namespacing and/or sails-hook- prefix
              hookName = identity.replace(/^(@.+?[\/\\])?(sails-hook-)?/, '');
            }

            if (sails.config.hooks[hookName] === false || sails.config.hooks[hookName] === 'false') {
              return memo;
            }

            // Allow overriding core hooks
            if (sails.hooks[hookName]) {
              sails.log.verbose('Found hook: `'+hookName+'` in `node_modules/`.  Overriding core hook w/ the same identity...');
            }

            // If we have a hook in api/hooks with this name, throw an error
            if (hooks[hookName]) {
              var err = (function (){
                var msg =
                'Found hook: `' + hookName + '`, in `node_modules/`, but a hook with that identity already exists in `api/hooks/`. '+
                'The hook defined in your `api/hooks/` folder will take precedence.';
                var err = new Error(msg);
                err.code = 'E_INVALID_HOOK_NAME';
                return err;
              })();
              sails.log.warn(err);
              return memo;
            }

            // Load the hook code
            var hook = require(path.resolve(sails.config.appPath, 'node_modules', identity));

            // Set its config key (defaults to the hook name)
            hook.configKey = (sails.config.installedHooks && sails.config.installedHooks[identity] && sails.config.installedHooks[identity].configKey) || hookName;

            // Add this to the list of hooks to load
            memo[hookName] = hook;

            return memo;
          }, {}));//</_.reduce() + _.extend()>

          return bindToSails(cb)(null, hooks);

        } catch (e) { return cb(e); }
      });//</after async.auto>
    },//<loadUserHooks>

    /**
     * Load custom blueprint actions.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadBlueprints: function (cb) {
      includeAll.optional({
        dirname: sails.config.paths.blueprints,
        filter: /^(.+)\.(?:(?!md|txt).)+$/,
        useGlobalIdForKeyName: true
      }, cb);
    },

    /**
     * Load custom API responses.
     *
     * @param {Object} options
     * @param {Function} cb
     */
    loadResponses: function (cb) {
      includeAll.optional({
        dirname: sails.config.paths.responses,
        filter: /^(.+)\.(?:(?!md|txt).)+$/,
        useGlobalIdForKeyName: true
      }, bindToSails(cb));
    },

    optional: includeAll.optional,
    required: includeAll.required,
    aggregate: includeAll.aggregate,
    exists: includeAll.exists

  };



  /**
   * Private helper function used above.
   *
   * @param  {Function} cb [description]
   * @return {Function}
   *         @param {Error?} err
   *         @param {Dictionary} modules
   */
  function bindToSails(cb) {
    return function(err, modules) {
      if (err) {return cb(err);}
      _.each(modules, function(moduleDef) {
        // Add a reference to the Sails app that loaded the module
        moduleDef.sails = sails;
        // Bind all methods to the module context
        _.bindAll(moduleDef);
      });
      return cb(undefined, modules);
    };
  }//</bindToSails definition (private helper function)>

};
