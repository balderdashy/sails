/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var async = require('async');
var flaverr = require('flaverr');
var __Configuration = require('./configuration');
var __initializeHooks = require('./private/loadHooks');
var __loadActionModules = require('./private/controller/load-action-modules');
var __checkGruntConfig = require('./private/checkGruntConfig');

/**
 * @param  {SailsApp} sails
 * @returns {Function}
 */
module.exports = function(sails) {

  var Configuration = __Configuration(sails);
  var initializeHooks = __initializeHooks(sails);
  var checkGruntConfig = __checkGruntConfig(sails);

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

    // Log a verbose log message about the fact that EVEN MORE verbosity
    // is available in `silly` mode.
    sails.log.verbose('• • • • • • • • • • • • • • • • • • • • • • • • • • • • • •');
    sails.log.verbose('•  Loading Sails with "verbose" logging enabled...        •');
    sails.log.verbose('•  (For even more details, try "silly".)                  •');
    sails.log.silly  ('•  Actually, looks like you\'re already using "silly"!     •');
    sails.log.verbose('•                                                         •');
    sails.log.verbose('•  http://sailsjs.com/config/log                          •');
    sails.log.verbose('• • • • • • • • • • • • • • • • • • • • • • • • • • • • • •');

    // configOverride is optional
    if (_.isFunction(configOverride)) {
      cb = configOverride;
      configOverride = {};
    }

    // Ensure override is an object and clone it (or make an empty object if it's not).
    // The shallow clone protects against the caller accidentally adding/removing props
    // to the config after Sails has loaded (but they could still mess with nested config).
    configOverride = configOverride || {};
    sails.config = _.clone(configOverride);


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

      // Verify that the combination of Sails environment and NODE_ENV is valid
      // as early as possible -- that is, as soon as we know for sure what the
      // Sails environment is.
      verifyEnv: ['config', function(results, cb) {
        // If the userconfig hook is active, wait until it's finished to
        // verify the environment, since it might be set in a config file.
        if (_.isUndefined(sails.config.hooks) || (sails.config.hooks !== false && sails.config.hooks.userconfig !== false)) {
          sails.on('hook:userconfig:loaded', verifyEnvironment);
        }
        // Otherwise verify it right now.  The Sails environment will be
        // whatever was set on the command line, or via the sails_environment
        // env var, or defaulted to "development".
        else {
          verifyEnvironment();
        }
        return cb();
      }],

      // Check if the current app needs the Grunt hook installed but doesn't have it.
      grunt: ['config', checkGruntConfig],

      // Load hooks into memory, with their middleware and routes
      hooks: ['verifyEnv', 'config', helpLoadHooks],

      // Load actions from disk and config overrides
      controller: ['hooks', function(results, cb) {
        __loadActionModules(sails, cb);
      }],

      // Populate the "registry"
      // Houses "middleware-esque" functions bound by various hooks and/or Sails core itself.
      // (i.e. `function (req, res [,next]) {}`)
      //
      // (Basically, that means we grab an exposed `middleware` object,
      // full of functions, from each hook, then make it available as
      // `sails.middleware.[HOOK_ID]`.)
      //
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: finish refactoring to change "middleware" nomenclature
      // to avoid confusion with the more specific (and more common)
      // usage of the term.
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      registry: ['hooks',
        function populateRegistry(results, cb) {

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


  // ==============================================================================
  // < inline function declarations >
  //    ██╗    ██╗███╗   ██╗██╗     ██╗███╗   ██╗███████╗    ███████╗███╗   ██╗    ██████╗ ███████╗███████╗███████╗    ██╗
  //   ██╔╝    ██║████╗  ██║██║     ██║████╗  ██║██╔════╝    ██╔════╝████╗  ██║    ██╔══██╗██╔════╝██╔════╝██╔════╝    ╚██╗
  //  ██╔╝     ██║██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗      █████╗  ██╔██╗ ██║    ██║  ██║█████╗  █████╗  ███████╗     ╚██╗
  //  ╚██╗     ██║██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝      ██╔══╝  ██║╚██╗██║    ██║  ██║██╔══╝  ██╔══╝  ╚════██║     ██╔╝
  //   ╚██╗    ██║██║ ╚████║███████╗██║██║ ╚████║███████╗    ██║     ██║ ╚████║    ██████╔╝███████╗██║     ███████║    ██╔╝
  //    ╚═╝    ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝    ╚═╝     ╚═╝  ╚═══╝    ╚═════╝ ╚══════╝╚═╝     ╚══════╝    ╚═╝
  //

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: extrapolate the following inline function definitions into
  // separate files -- or if appropriate (and if there's no tangible impact
  // on lift performance) then pull them inline above.
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  /**
   * Load hooks in parallel
   * let them work out dependencies themselves,
   * taking advantage of events fired from the sails object
   *
   * @api private
   */
  function helpLoadHooks(results, cb) {
    sails.hooks = { };

    // If config.hooks is disabled, skip hook loading altogether
    if (sails.config.hooks === false) {
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
      if (err) { return cb(err); }

      // Inform any listeners that the initial, built-in hooks
      // are finished loading
      sails.emit('hooks:builtIn:ready');
      sails.log.silly('Built-in hooks are ready.');
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

  function verifyEnvironment() {
    // At this point, the Sails environment is set to its final value,
    // whether it came from the command line or a config file. So we
    // can now compare it to the NODE_ENV environment variable and
    // act accordingly.  This may involve changing NODE_ENV to "production",
    // which we want to do as early as possible since dependencies might
    // be relying on that value.

    // If the Sails environment is production, but NODE_ENV is undefined,
    // log a warning and change NODE_ENV to "production".
    if (sails.config.environment === 'production' && process.env.NODE_ENV !== 'production' ) {
      if (_.isUndefined(process.env.NODE_ENV)) {
        sails.log.debug('Detected Sails environment is "production", but NODE_ENV is `undefined`.');
        sails.log.debug('Automatically setting the NODE_ENV environment variable to "production".');
        sails.log.debug();
        process.env.NODE_ENV = 'production';
      } else {
        throw flaverr({ name: 'userError', code: 'E_INVALID_NODE_ENV' }, new Error('When the Sails environment is set to "production", NODE_ENV must also be set to "production" (but it was set to "' + process.env.NODE_ENV + '" instead).'));
      }
    }
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

      sails.log.silly('The router & all hooks were loaded successfully.');

      // If userconfig hook is turned off, still load globals.
      if (sails.config.hooks && sails.config.hooks.userconfig === false ||
           (sails.config.loadHooks && sails.config.loadHooks.indexOf('userconfig') === -1)) {
        sails.exposeGlobals();
      }

      // If the Sails environment is set to "production" but the Node environment isn't,
      // log a warning.
      if (sails.config.environment === 'production' && process.env.NODE_ENV !== 'production') {
        sails.log.warn('Detected Sails environment of `production`, but Node environment is `' + process.env.NODE_ENV + '`.\n' +
                       'It is recommended that in production mode, both the Sails and Node environments be set to `production`.');
      }

      cb && cb(null, sails);
    };
  }

  //    ██╗    ██╗    ██╗███╗   ██╗██╗     ██╗███╗   ██╗███████╗    ███████╗███╗   ██╗    ██████╗ ███████╗███████╗███████╗    ██╗
  //   ██╔╝   ██╔╝    ██║████╗  ██║██║     ██║████╗  ██║██╔════╝    ██╔════╝████╗  ██║    ██╔══██╗██╔════╝██╔════╝██╔════╝    ╚██╗
  //  ██╔╝   ██╔╝     ██║██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗      █████╗  ██╔██╗ ██║    ██║  ██║█████╗  █████╗  ███████╗     ╚██╗
  //  ╚██╗  ██╔╝      ██║██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝      ██╔══╝  ██║╚██╗██║    ██║  ██║██╔══╝  ██╔══╝  ╚════██║     ██╔╝
  //   ╚██╗██╔╝       ██║██║ ╚████║███████╗██║██║ ╚████║███████╗    ██║     ██║ ╚████║    ██████╔╝███████╗██║     ███████║    ██╔╝
  //    ╚═╝╚═╝        ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝    ╚═╝     ╚═╝  ╚═══╝    ╚═════╝ ╚══════╝╚═╝     ╚══════╝    ╚═╝
  //
  // </ inline function declarations (see note above) >
  // ==============================================================================


};
