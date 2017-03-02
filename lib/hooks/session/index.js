/**
 * Module dependencies.
 */

var path = require('path');
var util = require('util');
var _ = require('@sailshq/lodash');


// generateSecret is used to generate a one-off session secret if one wasn't configured
var generateSecret = require('./generateSecret');

// (this dependency is just for creating new cookies)
var uid = require('uid-safe').sync;

// (these two dependencies are only here for sails.session.parseSessionIdFromCookie(),
//  which is only here to enable socket lifecycle callbacks)
var parseCookie = require('cookie').parse;
var stringifyCookie = require('cookie').serialize;
var unsignCookie = require('cookie-signature').unsign;
var signCookie = require('cookie-signature').sign;
var pathToRegexp = require('path-to-regexp');

module.exports = function(app) {

  var getSession = function(sessionId, errorMessage, cb) {
    app.config.session.store.get(sessionId, function (err, session) {
      if (err) { return cb(err); }
      if (!session) {
        return cb((function _createError(){
          var e = new Error(errorMessage);
          e.code = 'E_SESSION';
          return e;
        })());
      }
      return cb(null, session);
    });
  };
  // `session` hook definition
  var SessionHook = {


    defaults: {
      session: {
        adapter: 'memory',
        key: 'sails.sid',
        routesDisabled: []
      }
    },


    /**
     * Normalize and validate configuration for this hook.
     * Then fold any modifications back into `sails.config`
     */
    configure: function() {

      // Validate config
      // Ensure that secret is specified if a custom session store is used
      if (app.config.session) {
        if (!_.isObject(app.config.session)) {
          throw new Error('Invalid custom session store configuration!\n' +
            '\n' +
            'Basic usage ::\n' +
            '{ session: { adapter: "memory", secret: "someVerySecureString", /* ...if applicable: host, port, etc... */ } }' +
            '\n\nCustom usage ::\n' +
            '{ session: { store: { /* some custom connect session store instance */ }, secret: "someVerySecureString", /* ...custom settings.... */ } }'
          );
        }

      }

      // If session secret is undefined, set a secure, one-time use secret
      if (!app.config.session || !app.config.session.secret) {

        app.log.verbose('Session secret not defined-- automatically generating one for now...');

        if (app.config.environment === 'production') {
          app.log.warn('Session secret should be manually specified in production!');
          app.log.warn('Automatically generating one for now...');

          app.log.error('This generated session secret is NOT OK for production!');
          app.log.error('It will change each time the server starts and break multi-instance deployments.');
          app.log.blank();
          app.log.error('To set up a session secret, add or update it in `config/session.js`:');
          app.log.error('module.exports.session = { secret: "keyboardcat" }');
          app.log.blank();
        }

        app.config.session.secret = generateSecret();
      }

      // If secret _is_ defined, make sure it's a string
      else if (app.config.session.secret && !_.isString(app.config.session.secret)) {
        throw new Error('If provided, sails.config.session.secret should be a string.');
      }


      // Validate `routesDisabled`, if specified.
      if (app.config.session.routesDisabled && !_.isArray(app.config.session.routesDisabled)) {
        throw new Error('Invalid `sails.config.session.routesDisabled` configuration!\n' +
          '(must be an array of route address strings)'
        );
      }


      // Backwards-compatibility / shorthand notation
      // (allow mongo or redis session stores to be specified directly)
      if (app.config.session.adapter === 'redis') {
        app.config.session.adapter = 'connect-redis';
      }
      else if (app.config.session.adapter === 'mongo') {
        app.config.session.adapter = 'connect-mongo';
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
      var sessionConfig = app.config.session;

      // Build `sails.hooks.session.routesDisabled`.
      // (only salient if `sails.config.session.routesDisabled` was specified)
      try {

        app.hooks.session.routesDisabled = _.reduce(sessionConfig.routesDisabled || [], function (memo, routeAddressStr){

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
          var urlPatternRegExp = pathToRegexp(urlPattern, []);

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


      // Intepret session adapter config and "new up" a session store
      if (_.isObject(sessionConfig) && !_.isObject(sessionConfig.store)) {

        // Unless the session is explicitly disabled, require the appropriate adapter
        if (sessionConfig.adapter) {

          // 'memory' is a special case
          if (sessionConfig.adapter === 'memory') {
            var MemoryStore = require('express-session').MemoryStore;
            sessionConfig.store = new MemoryStore();
          }
          // Try and load the specified adapter from the local sails project,
          // or catch and return error:
          else {

            var COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR = function (adapter, e, onRequire) {
              var errMsg;
              if (e && typeof e === 'object' && e instanceof Error) {
                errMsg = e.stack;
              }
              else {
                errMsg = util.inspect(e);
              }

              var output = 'Could not load Connect session adapter :: ' + adapter + '\n';
              output+='\nError from adapter:\n'+ errMsg+'\n\n';

              // If the error happened while attempting to require() the adapter, output some
              // (hopefully) helpful instructions on installing the adapter
              if (onRequire) {

                output += 'Do you have the Connect session adapter installed in this project?\n';
                output += 'Try running the following command in your project\'s root directory:\n';
                var installRecommendation = 'npm install ';
                installRecommendation += adapter;
                installRecommendation +='\n(Note: Make sure the version of the Connect adapter you install is compatible with Express 3/Sails v0.10)';
                installRecommendation += '\n';

                output += installRecommendation;
              }

              return output;
            };

            var SessionAdapter;
            try {
              // Attempt to initialize the adapter using the express-session module
              SessionAdapter = require(path.resolve(app.config.appPath, 'node_modules', sessionConfig.adapter));
              try {
                var CustomStore = SessionAdapter(require('express-session'));
                sessionConfig.store = new CustomStore(sessionConfig);
              } catch (e) {
                // If that fails, attempt to initialize the adapter using express
                // (required by older session adapters)
                try {
                  var CustomStore = SessionAdapter(require('@sailshq/express'));
                  sessionConfig.store = new CustomStore(sessionConfig);
                }
                catch (e2) {
                  // Failed attempting to initialize adapter; output a message w/ error info
                  // TODO: negotiate error and give better error msg depending on code
                  return cb(COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR(sessionConfig.adapter, e));
                }
              }
            } catch(e) {
              return cb(COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR(sessionConfig.adapter, e, true));
            }
          }
        }
      }

      // Expose hook as `sails.session`
      app.session = SessionHook;

      return cb();
    },


    /**
     * Generate a cookie to represent a new session.
     *
     * @return {String}
     * @api private
     */

    generateNewSidCookie: function (){
      var sid = uid(24);
      var signedSid = 's:' + signCookie(sid, app.config.session.secret);
      var cookie = stringifyCookie(app.config.session.key, signedSid, {});
      return cookie;
    },



    /**
     * Parse and unsign (i.e. decrypt) the provided cookie to get the session id.
     *
     * (adapted from code in the `express-session`)
     * (TODO: pull out into separate module as part of jshttp/pillarjs)
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
      var parsedSidCookie = parseCookie(cookie)[app.config.session.key];

      if (typeof parsedSidCookie !== 'string') {
        throw (function createError(){
          var err = new Error('No sid cookie exists');
          err.status = 401;
          err.code = 'E_SESSION_PARSE_COOKIE';
          return err;
        })();
      }

      if (parsedSidCookie.substr(0, 2) !== 's:') {
        throw (function createError(){
          var err = new Error('Cookie unsigned');
          err.status = 401;
          err.code = 'E_SESSION_PARSE_COOKIE';
          return err;
        })();
      }

      // Unsign cookie
      var sessionId = unsignCookie(parsedSidCookie.slice(2), sessionSecret);

      if (sessionId === false) {
        throw (function createError(){
          var err = new Error('Cookie signature invalid');
          err.status = 401;
          err.code = 'E_SESSION_PARSE_COOKIE';
          return err;
        })();
      }

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
      return getSession(sessionId, 'Session could not be loaded', cb);
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
      return app.config.session.store.set(sessionId, data, function (err) {
        if (err) return cb(err);
        return getSession(sessionId, 'Session could not be saved', cb);
      });
    }
  };

  return SessionHook;
};
