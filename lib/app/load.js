/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');
var util = require('util');
var __Configuration = require('./configuration');
var __initializeHooks = require('./private/loadHooks');


module.exports = function(sails) {

  var Configuration = __Configuration(sails);
  var initializeHooks = __initializeHooks(sails);

  /**
   * Expose loader start point.
   * (idempotent)
   *
   * @api public
   */

  return function load(configOverride, cb) {

    if (sails._exiting) {
      return cb(new Error('\n*********\nCannot load or lift an app after it has already been lowered. \nYou can make a new app instance with:\nvar SailsApp = require(\'sails\').Sails;\nvar sails = new SailsApp();\n\nAnd then you can do:\nsails.load([opts,] cb)\n\n'));
    }

    // configOverride is optional
    if (_.isFunction(configOverride)) {
      cb = configOverride;
      configOverride = {};
    }

    // Ensure override is an object and clone it (or make an empty object if it's not)
    configOverride = configOverride || {};
    sails.config = _.cloneDeep(configOverride);


    // If host is explicitly specified, set `explicitHost`
    // (otherwise when host is omitted, Express will accept all connections via INADDR_ANY)
    if (configOverride.host) {
      configOverride.explicitHost = configOverride.host;
    }

    // Optionally expose services, models, sails, _, async, etc. as globals as soon as the
    // user config loads.
    sails.on('hook:userconfig:loaded', sails.exposeGlobals);

    async.auto({

      // Apply core defaults and hook-agnostic configuration,
      // esp. overrides including command-line options, environment variables,
      // and options that were passed in programmatically.
      config: [Configuration.load],

      // Load hooks into memory, with their middleware and routes
      hooks: ['config', loadHooks],

      // Populate the "registry"
      // Houses "middleware-esque" functions bound by various hooks and/or Sails core itself.
      // (i.e. `function (req, res [,next]) {}`)
      //
      // (Basically, that means we grab an exposed `middleware` object,
      // full of functions, from each hook, then make it available as
      // `sails.middleware.[HOOK_ID]`.)
      //
      // TODO: finish refactoring to change "middleware" nomenclature
      // to avoid confusion with the more specific (and more common)
      // usage of the term.
      registry: ['hooks',
        function populateRegistry(cb) {

          sails.log.verbose('Instantiating registry...');

          // Iterate through hooks and absorb the middleware therein
          // Save a reference to registry and expose it on
          // the Sails instance.
          sails.middleware = sails.registry =
          // Namespace functions by their source hook's identity
          _.reduce(sails.hooks, function(registry, hook, identity) {
            registry[identity] = hook.middleware;
            return registry;
          }, {});

          sails.emit('middleware:registered');

          cb();
        }
      ],

      // Load the router and bind routes in `sails.config.routes`
      router: ['registry', sails.router.load]

    }, ready__(cb));

    // Makes `app.load()` chainable
    return sails;
  };



  /**
   * Load hooks in parallel
   * let them work out dependencies themselves,
   * taking advantage of events fired from the sails object
   *
   * @api private
   */

  function loadHooks(cb) {
    sails.hooks = {};

    // If config.hooks is disabled, skip hook loading altogether
    if (!sails.config.hooks) {
      return cb();
    }


    async.series([

      function(cb) {
        loadHookDefinitions(sails.hooks, cb);
      },
      function(cb) {
        initializeHooks(sails.hooks, cb);
      }
    ], function(err) {
      if (err) return cb(err);

      // Inform any listeners that the initial, built-in hooks
      // are finished loading
      sails.emit('hooks:builtIn:ready');
      sails.log.verbose('Built-in hooks are ready.');
      return cb();
    });
  }



  /**
   * Load built-in hook definitions from `sails.config.hooks`
   * and put them back into `hooks` (probably `sails.hooks`)
   *
   * @api private
   */

  function loadHookDefinitions(hooks, cb) {

    // Mix in user-configured hook definitions
    _.extend(hooks, sails.config.hooks);

    // Make sure these changes to the hooks object get applied
    // to sails.config.hooks to keep logic consistent
    // (I think we can get away w/o this, but leaving as a stub)
    // sails.config.hooks = hooks;

    // If user configured `loadHooks`, only include those.
    if (sails.config.loadHooks) {
      if (!_.isArray(sails.config.loadHooks)) {
        return cb('Invalid `loadHooks` config.  ' +
          'Please specify an array of string hook names.\n' +
          'You specified ::' + util.inspect(sails.config.loadHooks));
      }

      _.each(hooks, function(def, hookName) {
        if (!_.contains(sails.config.loadHooks, hookName)) {
          hooks[hookName] = false;
        }
      });
      sails.log.verbose('Deliberate partial load-- will only initialize hooks ::', sails.config.loadHooks);
    }

    return cb();
  }


  /**
   * Returns function which is fired when Sails is ready to go
   *
   * @api private
   */

  function ready__(cb) {
    return function(err) {
      if (err) {
        return cb && cb(err);
      }


      sails.log.verbose('All hooks were loaded successfully.');

      // If userconfig hook is turned off, still load globals.
      if (sails.config.hooks && sails.config.hooks.userconfig === false ||
           (sails.config.loadHooks && sails.config.loadHooks.indexOf('userconfig') == -1)) {
            sails.exposeGlobals();
      }


      cb && cb(null, sails);
    };
  }
};
