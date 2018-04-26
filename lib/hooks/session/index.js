/**
 * Module dependencies.
 */

var path = require('path');
var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var Redis = require('machinepack-redis');

// (this dependency is just for creating new cookies)
var uid = require('uid-safe');

// (these two dependencies are only here for sails.session.parseSessionIdFromCookie(),
//  which is only here to enable socket lifecycle callbacks)
var parseCookie = require('cookie').parse;
var stringifyCookie = require('cookie').serialize;
var unsignCookie = require('cookie-signature').unsign;
var signCookie = require('cookie-signature').sign;
var pathToRegexp = require('path-to-regexp');

module.exports = function(app) {

  // `session` hook definition
  var SessionHook = {


    defaults: {
      session: {
        adapter: 'memory',
        name: 'sails.sid',
        // By default, disable session for requests to paths that look like static assets.
        isSessionDisabled: function (req){
          return !!req.path.match(req._sails.LOOKS_LIKE_ASSET_RX);
        }
      }
    },


    /**
     * Normalize and validate configuration for this hook.
     * Then fold any modifications back into `sails.config`
     */
    configure: function() {

      // Validate config
      // Ensure that session config is at least an object of some kind.
      if (app.config.session) {
        if (!_.isObject(app.config.session)) {
          throw flaverr({ name: 'userError', code: 'E_INVALID_SESSION_CONFIG' }, new Error('Invalid custom session store configuration!\n' +
            '\n' +
            'Basic usage ::\n' +
            '{ session: { adapter: "memory", secret: "someVerySecureString", /* ...if applicable: host, port, etc... */ } }' +
            '\n\nCustom usage ::\n' +
            '{ session: { store: { /* some custom connect session store instance */ }, secret: "someVerySecureString", /* ...custom settings.... */ } }'
          ));
        }

      }

      if (!app.config.session.secret && process.env.NODE_ENV !== 'production') {
        app.config.session.secret = 'extremely-secure-keyboard-cat';
        app.log.debug('Warning: no session secret was set!  In development mode, we\'ll set this for you,');
        app.log.debug('but session secret must be manually specified in production.');
        app.log.debug('To set up a session secret, add or update it in `config/session.js`:');
        app.log.debug('module.exports.session = { secret: \'extremely-secure-keyboard-cat\' }');
        app.log.debug();
        app.log.debug('(Or if you don\'t need sessions enabled, disable the hook.)');
        app.log.debug();
        app.log.debug('For more help:');
        app.log.debug(' • https://sailsjs.com/config/session');
        app.log.debug(' • https://sailsjs.com/support');
        app.log.debug();
      }

      // Throw if the old `routesDisabled` is used instad of `isSessionDisabled`.
      if (app.config.session.routesDisabled) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SESSION_CONFIG' }, new Error(
                        '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
                        'The `sails.config.session.routesDisabled` property is no longer supported in Sails 1.0.\n'+
                        'Instead, specify a `sails.config.session.isSessionDisabled` function which takes the\n'+
                        'request object as an argument and returns `true` if the session should be disabled,\n'+
                        'and `false` otherwise.\n'+
                        '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'));
      }

      // Throw if `isSessionDisabled` defined, but is not a function.
      if (!_.isUndefined(app.config.session.isSessionDisabled) && !_.isFunction(app.config.session.isSessionDisabled)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SESSION_CONFIG' }, new Error(
                        '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
                        'The `sails.config.session.isSessionDisabled` property, if specified, must be a function.\n'+
                        'Instead, got: `' + util.inspect(app.config.session.isSessionDisabled) + '`.\n'+
                        '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'));
      }

      // Throw if `cookie.secure` is defined, but is not a boolean.
      if (!_.isUndefined(_.get(app.config.session, 'cookie.secure')) && !_.isBoolean(app.config.session.cookie.secure)) {
        throw flaverr({ name: 'userError', code: 'E_SESSION_BAD_COOKIE_SECURE' }, new Error(
                        '\n-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'+
                        'The `sails.config.session.cookie.secure` property, if specified, must be a boolean.\n'+
                        'Instead, got: `' + util.inspect(app.config.session.cookie.secure) + '` (which is type `' + (typeof app.config.session.cookie.secure) + '`).\n'+
                        '-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n'));
      }

      // Throw if `cookie.secure` is defined, but is not a boolean.
      if (process.env.NODE_ENV === 'production') {
        if (_.get(app.config.session, 'cookie.secure') !== true) {
          app.log.debug('Warning: since `sails.config.session.cookie.secure` is not set to `true`, the session');
          app.log.debug('cookie will be sent over non-TLS connections (i.e. with insecure http:// requests).');
          app.log.debug('To enable secure cookies, set `sails.config.session.cookie.secure` to `true`.');
          app.log.debug();
          app.log.debug('If your app is behind a proxy or load balancer (e.g. on a PaaS like Heroku), you');
          app.log.debug('may also need to set `sails.config.http.trustProxy` to `true`.');
          app.log.debug();
          app.log.debug('For more help:');
          app.log.debug(' • https://sailsjs.com/config/session#?the-secure-flag');
          app.log.debug(' • https://sailsjs.com/config/session#?do-i-need-an-ssl-certificate');
          app.log.debug(' • https://sailsjs.com/config/sails-config-http#?properties');
          app.log.debug(' • https://sailsjs.com/support');
          app.log.debug();
        }

        else {
          app.log.debug('Please note: since `sails.config.session.cookie.secure` is set to `true`, the session cookie ');
          app.log.debug('will _only_ be sent over TLS connections (i.e. secure https:// requests).');
          app.log.debug('Requests made via http:// will not include a session cookie!');
          app.log.debug();
          if (app.config.http.trustProxy === false) {
            app.log.debug('Also, note that since `sails.config.http.trustProxy` is set to `false`, secure cookies');
            app.log.debug('(and potentially all sessions+login over "https://") may not work if your app is hosted');
            app.log.debug('behind a proxy or load balancer -- for example, on a PaaS like Heroku or EBS.');
            app.log.debug();
          }
          app.log.debug('For more help:');
          app.log.debug(' • https://sailsjs.com/config/session#?the-secure-flag');
          app.log.debug(' • https://sailsjs.com/config/session#?do-i-need-an-ssl-certificate');
          app.log.debug(' • https://sailsjs.com/config/sails-config-http#?properties');
          app.log.debug(' • https://sailsjs.com/support');
          app.log.debug();
        }
      }


      // If session secret is undefined, set a secure, one-time use secret
      if (!app.config.session || !app.config.session.secret) {

        app.log.verbose('Session secret not defined...');

        if (process.env.NODE_ENV === 'production') {
          throw new Error(
            'Session secret should be manually specified in production!\n'+
            'To set up a session secret, add or update it in `config/session.js`:\n'+
            'module.exports.session = { secret: \'extremely-secure-keyboard-cat\' }\n'+
            '\n'+
            '(Or if you don\'t need sessions enabled, disable the hook.)\n'+
            '\n'+
            'For more help:\n'+
            ' • https://sailsjs.com/config/session\n'+
            ' • https://sailsjs.com/support'
          );
        }

      }
      //‡
      // If secret _is_ defined, make sure it's a string
      else if (app.config.session.secret && !_.isString(app.config.session.secret)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SESSION_CONFIG' }, new Error('If provided, sails.config.session.secret should be a string.'));
      }


      // Validate `routesDisabled`, if specified.
      if (app.config.session.routesDisabled && !_.isArray(app.config.session.routesDisabled)) {
        throw flaverr({ name: 'userError', code: 'E_INVALID_SESSION_CONFIG' }, new Error('Invalid `sails.config.session.routesDisabled` configuration!\n' +
          '(must be an array of route address strings)'
        ));
      }


      // Backwards-compatibility / shorthand notation
      // (allow mongo or redis session stores to be specified directly)
      if (app.config.session.adapter === 'redis') {
        app.config.session.adapter = 'connect-redis';
      }
      else if (app.config.session.adapter === 'mongo') {
        app.config.session.adapter = 'connect-mongo';
      }

      // If `key` is provided, transform it to `name` and log a warning.
      if (_.isString(app.config.session.key)) {
        app.config.session.name = app.config.session.key;
        app.log.debug('The `sails.config.session.key` setting is deprecated; please use `sails.config.session.name` instead.\n');
      }

      // If a URL was provided, make sure it has no trailing slash.
      if (_.isString(app.config.session.url)) {
        app.config.session.url = app.config.session.url.replace(/\/$/,'');
      }

    },

    /**
     * initialize() is run when the session hook is loaded.
     *
     * (Its primary responsibility is to create a session store instance
     *  and keep it around.)
     *
     * @api private
     */
    initialize: function(cb) {

      // Build `sails.hooks.session.routesDisabled`.
      // (only salient if `sails.config.session.routesDisabled` was specified)
      try {
        // Regex to check if the route is...a regex.
        var regExRoute = /^r\|(.*)\|(.*)$/;

        app.hooks.session.routesDisabled = _.reduce(app.config.session.routesDisabled || [], function (memo, routeAddressStr){

          // Validate and parse route address.
          if (!_.isString(routeAddressStr)){
            throw new Error('Cannot parse route address (`'+routeAddressStr+'`). Must be a string.');
          }
          var addrPieces = routeAddressStr.split(/\s/);

          var method;
          var urlPattern;
          if (addrPieces.length === 1) {
            method = '';
            urlPattern = addrPieces[0];
          }
          else if (addrPieces.length === 2) {
            method = addrPieces[0];
            urlPattern = addrPieces[1];
          }
          else {
            throw new Error('Cannot parse route address (`'+routeAddressStr+'`). When split on whitespace, there are either too many or too few pieces (`'+addrPieces.length+'`).');
          }

          // Generate a regular expression from the URL pattern string.
          var urlPatternRegExp;


          // Perform the check
          var matches = urlPattern.match(regExRoute);

          // If it *is* a regex, create a RegExp object that Express can bind,
          // pull out the params, and wrap the handler in regexRouteWrapper
          if (matches) {
            urlPatternRegExp = new RegExp(matches[1]);
          } else {
            urlPatternRegExp = pathToRegexp(urlPattern, []);
          }

          memo.push({
            method: method,
            urlPatternRegExp: urlPatternRegExp
          });
          return memo;
        }, []);//</_.reduce()>

      } catch (e) {
        return cb(
          new Error('Failed to parse one of the route addresses provided in `sails.config.session.routesDisabled`.\n'+
          'If specified, this config must be an array of normal route address strings.\n'+
          'Error details:'+e.stack)
        );
      }


      //  ┌─┐┌─┐┌┬┐  ┬ ┬┌─┐  ┌─┐┬─┐┌─┐┬  ┬┬┌┬┐┌─┐┌┬┐  ┌─┐┌┬┐┌─┐┌─┐┌┬┐┌─┐┬─┐
      //  └─┐├┤  │   │ │├─┘  ├─┘├┬┘│ │└┐┌┘│ ││├┤  ││  ├─┤ ││├─┤├─┘ │ ├┤ ├┬┘
      //  └─┘└─┘ ┴   └─┘┴    ┴  ┴└─└─┘ └┘ ┴─┴┘└─┘─┴┘  ┴ ┴─┴┘┴ ┴┴   ┴ └─┘┴└─
      (function setupAdapter(proceed) {

        // If no adapter config was provided, skip down to creating the session middleware.
        if (!_.isObject(app.config.session) || !app.config.session.adapter) { return proceed(); }

        // 'memory' is a special case
        if (app.config.session.adapter === 'memory') {
          var MemoryStore = require('express-session').MemoryStore;
          app.config.session.store = new MemoryStore();
          return proceed();
        }//‡
        // For all other adapters, we'll try to require the module and do some setup.
        else {

          //  ┌─┐┌─┐┌┬┐  ┬ ┬┌─┐  ┬─┐┌─┐┌┬┐┬┌─┐  ┌─┐┌┬┐┌─┐┌─┐┌┬┐┌─┐┬─┐
          //  └─┐├┤  │   │ │├─┘  ├┬┘├┤  │││└─┐  ├─┤ ││├─┤├─┘ │ ├┤ ├┬┘
          //  └─┘└─┘ ┴   └─┘┴    ┴└─└─┘─┴┘┴└─┘  ┴ ┴─┴┘┴ ┴┴   ┴ └─┘┴└─
          (function maybeConnectToRedis(proceed) {

            // If the adapter isn't set to `connect-redis`/`@sailshq/connect-redis`,
            // or an existing Redis client is being provided, skip this part.
            if ((app.config.session.adapter !== 'connect-redis' && app.config.session.adapter !== '@sailshq/connect-redis') || app.config.session.client) {
              return proceed();
            }//•

            // If a connection URL is provided, use that, otherwise construct one from the pieces
            // provided in the session config.
            var url = app.config.session.url || Redis.createConnectionUrl(_.pick(app.config.session, ['host', 'port', 'pass', 'db'])).execSync();

            // Create a Redis connection manager.
            Redis.createManager({
              connectionString: url,
              meta: _.omit(app.config.session, ['host', 'port', 'pass', 'db', 'url', 'adapter']),
              // Handle failures on the connection.
              onUnexpectedFailure: function(err) {
                // If Sails is already on the way out, ignore the Redis issue.
                if (app._exiting) {
                  return;
                }

                // Log the error from Redis in verbose mode.
                app.log.verbose('Redis connection manager failed unexpectedly.  Details:', err);

                // If the Redis client disconnected, say something and run any custom logic
                // that was provided for this occasion.
                if (err.failureType === 'end') {
                  if (_.isFunction(app.config.session.onRedisDisconnect)) {
                    app.config.session.onRedisDisconnect();
                  } else {
                    app.log.error('Redis session server went offline...');
                  }
                  // If a disconnected client comes back, say something and run any custom logic
                  // that was provided for this occasion.
                  err.connection.once('ready', function() {
                    if (_.isFunction(app.config.session.onRedisReconnect)) {
                      app.config.session.onRedisReconnect();
                    } else {
                      app.log.error('Redis session server came back online...');
                    }
                  });
                }
              }
            }).exec(function(err, createManagerResult) {
              if (err) { return proceed(err); }

              // Use the manager to create a new Redis connection.
              Redis.getConnection({
                manager: createManagerResult.manager
              }).exec({
                error: function(err) { return proceed(err); },
                failed: function(report) { return proceed(report.error); },
                success: function(result) {
                  // Save the connected client into the session config so that it can be used
                  // by the connect-redis module.
                  app.config.session.client = result.connection;
                  return proceed();
                }
              });

            });
          })(function afterMaybeConnectToRedis(err) {
            if (err) { return proceed(err); }

            // This local variable is used to hold the connect session adapter.
            // (we determine what it is below)
            var SessionAdapter;

            // If `sails.config.session.adapter` is a string, attempt to require the
            // module identified by the string.
            if (_.isString(app.config.session.adapter)) {

              try {
                SessionAdapter = require(path.resolve(app.config.appPath, 'node_modules', app.config.session.adapter));
              }
              catch(rawRequireErr) {

                // If an error occurred while attempting to require() the adapter, include
                // some (hopefully) helpful instructions on installing the adapter.
                return proceed(new Error(
                  // 'Could not require `' + app.config.session.adapter + '` (a session adapter).\n'+
                  'Do you have `' + app.config.session.adapter + '` installed locally?\n'+
                  'If not, try running the following command in your app\'s root directory:\n'+
                  'npm install ' + app.config.session.adapter + '\n'+
                  '(Note: Make sure to install a Connect session adapter that is compatible with this version of Sails.)\n'+
                  '\n'+
                  'For debugging purposes, here is the error from attempting to run `require(\''+app.config.session.adapter+'\')`:\n'+
                  '---\n'+
                  (function _getAppropriateMessageFromRawRequireErr(){
                    if (_.isError(rawRequireErr)) { return rawRequireErr.stack; }
                    else if (_.isString(rawRequireErr)) { return rawRequireErr; }
                    else { return util.inspect(rawRequireErr, { depth: null }); }
                  })()+'\n'+
                  '---\n'
                ));

              }//</catch :: require>

            }//</if .session.adapter is a string>
            //‡
            // Otherwise if it's an object (including a function!), set SessionAdapter to that value.
            else if (_.isObject(app.config.session.adapter)) {
              SessionAdapter = app.config.session.adapter;
            }
            // Otherwise bail, because sails.config.session.adapter is invalid.
            else {
              return proceed(new Error('If configured, `sails.config.session.adapter` should be a reference to an Express session adapter!  Instead got `' + util.inspect(app.config.session.adapter)));
            }

            // Okay, so now we have an adapter that we can call to create an
            // Express session store.  So we'll attempt to create the store
            // by passing the `express-session` module into the adapter.
            try {
              var CustomStore = SessionAdapter(require('express-session'));
              app.config.session.store = new CustomStore(app.config.session);
            }
            catch (rawSessionStoreCreationErr) {

              // Failed attempting to initialize adapter; output a message w/ error info
              return proceed(new Error(
                'Encountered error attempting to instantiate a session store using the installed version of `' + app.config.session.adapter + '` (a session adapter).\n'+
                'Raw error from the session adapter:\n'+
                '---\n'+
                (function _getAppropriateMessageFromRawSessionAdapterErr(){
                  if (_.isError(rawSessionStoreCreationErr)) {
                    // FUTURE: negotiate faw error and give better error msg depending on code
                    // (not sure if things are quite ready in the express-session adapter spec yet to make this possible)
                    return rawSessionStoreCreationErr.stack;
                  }
                  else if (_.isString(rawSessionStoreCreationErr)) { return rawSessionStoreCreationErr; }
                  else { return util.inspect(rawSessionStoreCreationErr, { depth: null }); }
                })()+'\n'+
                '---\n'+
                '\n'
              ));

            } //</catch :: failed to instantiate session adapter by passing in express-session>

            return proceed();
          });//</ self-calling function>

        }//</else (if we're using a custom store and NOT the memory store)>

      })(function afterSettingUpAdapter (err) {//~∞%°
        if (err) { return cb(err); }

        // Expose hook as `sails.session`
        app.session = SessionHook;

        // Build configuration the raw session middleware, using the
        // session config built above (including the adapter and store)
        // and adding a couple of defaults for extra options like `resave`.
        var opts = _.extend({
          resave: true,// FUTURE: set `resave: false` (see https://github.com/expressjs/session/tree/8e56128d8ba014ab586521247977b0d4e67340f9#resave)
          saveUninitialized: true// FUTURE: set `saveUninitialized: false` (see https://github.com/expressjs/session/tree/8e56128d8ba014ab586521247977b0d4e67340f9#saveuninitialized)
        }, app.config.session);

        // Get a raw express-session middleware function using the options
        // we just built.
        var rawSessionMiddleware = require('express-session')(opts);

        // Now wrap up the raw middleware in our own req/res/next function, and expose
        // it privately so it can be used by the private Sails router and the HTTP session middleware.
        app._privateSessionMiddleware = function(req, res, next) {
          // If an `isSessionDisabled` function is configured, run it against the current request
          // and if it returns `true`, skip the session middleware entirely.
          if(app.config.session.isSessionDisabled && app.config.session.isSessionDisabled(req)) {
            return next();
          }

          // Run the express session middleware that actually sets up the session.
          return rawSessionMiddleware(req, res, next);

        };

        return cb();

      }); //</self-calling function that sets up adapter)>

    }, // </initialize>


    /**
     * Generate a cookie to represent a new session.
     *
     * @return {String}
     * @api private
     */

    generateNewSidCookie: function (){

      var sid = uid.sync(24);
      var signedSid = 's:' + signCookie(sid, app.config.session.secret);
      var cookie = stringifyCookie(app.config.session.name, signedSid, {});
      return cookie;
    },



    /**
     * Parse and unsign (i.e. decrypt) the provided cookie to get the session id.
     *
     * (adapted from code in the `express-session`)
     *
     * @param  {String} cookie
     * @return {String}                [sessionId]
     *
     * @throws {Error} If cookie cannot be parsed or unsigned
     */
    parseSessionIdFromCookie: function (cookie){

      // e.g. "lolcatparty"
      var sessionSecret = app.config.session.secret;

      // Parse cookie
      var parsedSidCookie = parseCookie(cookie)[app.config.session.name];

      if (typeof parsedSidCookie !== 'string') {
        throw flaverr({ status: 401, code: 'E_SESSION_PARSE_COOKIE' }, new Error('No sid cookie exists'));
      }//-•

      if (parsedSidCookie.substr(0, 2) !== 's:') {
        throw flaverr({ status: 401, code: 'E_SESSION_PARSE_COOKIE' }, new Error('Cookie unsigned'));
      }//-•

      // Unsign cookie
      var sessionId = unsignCookie(parsedSidCookie.slice(2), sessionSecret);

      if (sessionId === false) {
        throw flaverr({ status: 401, code: 'E_SESSION_PARSE_COOKIE' }, new Error('Cookie signature invalid'));
      }//-•

      return sessionId;
    },


    /**
     * @param {String} sessionId
     * @param {Function} cb
     *
     * @api private
     */
    get: function(sessionId, cb) {
      if (!_.isFunction(cb)) {
        throw new Error('Invalid usage :: `sails.hooks.session.get(sessionId, cb)`');
      }

      app.config.session.store.get(sessionId, function (err, session) {
        if (err) { return cb(err); }

        if (!session) {
          return cb(flaverr('E_SESSION', new Error('Session could not be loaded.')));
        }

        return cb(null, session);

      });//</store.get>

    },

    /**
     * @param {String} sessionId
     * @param {} data
     * @param {Function} cb
     *
     * @api private
     */
    set: function(sessionId, data, cb) {
      if (!_.isFunction(cb)) {
        throw new Error('Invalid usage :: `sails.hooks.session.set(sessionId, data, cb)`');
      }

      // Attempt to persist data (upsert) to the session entry with the given `sessionId`.
      app.config.session.store.set(sessionId, data, function (err) {
        if (err) { return cb(err); }

        // Now look up the session so it can be sent back in its entirety.
        app.config.session.store.get(sessionId, function (err, session) {
          if (err) { return cb(err); }

          if (!session) {
            return cb(flaverr('E_SESSION', new Error('Session (`'+sessionId+'`) could not be located after saving.')));
          }

          return cb(null, session);

        });//</store.get>
      });//</store.set>

    }

  };

  return SessionHook;

};
