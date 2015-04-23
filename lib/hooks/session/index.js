/**
 * Module dependencies.
 */

var path = require('path');
var util = require('util');
var _ = require('lodash');


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

// (this dependency is only here for sails.session.generate()-
//  which is really only here to enable socket lifecycle callbacks)
var ConnectSession = require('express/node_modules/connect').middleware.session.Session;



module.exports = function(app) {

  // `session` hook definition
  var SessionHook = {


    defaults: {
      session: {
        adapter: 'memory',
        key: 'sails.sid'
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

      // If session config is set, but secret is undefined, set a secure, one-time use secret
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
     * Create a connection to the configured session store
     * and keep it around
     *
     * @api private
     */
    initialize: function(cb) {
      var sessionConfig = app.config.session;
      // console.log('Initializing session hook...');

      // Intepret session adapter config and "new up" a session store
      if (_.isObject(sessionConfig) && !_.isObject(sessionConfig.store)) {

        // Unless the session is explicitly disabled, require the appropriate adapter
        if (sessionConfig.adapter) {

          // 'memory' is a special case
          if (sessionConfig.adapter === 'memory') {
            var MemoryStore = require('express').session.MemoryStore;
            sessionConfig.store = new MemoryStore();
          }
          // Try and load the specified adapter from the local sails project,
          // or catch and return error:
          else {

            var COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR = function (adapter, packagejson, e) {
              var errMsg;
              if (e && typeof e === 'object' && e instanceof Error) {
                errMsg = e.stack;
              }
              else {
                errMsg = util.inspect(e);
              }

              var output = 'Could not load Connect session adapter :: ' + adapter + '\n';
              if (packagejson && !packagejson.main) {
                output+='(If this is your module, make sure that the module has a "main" configuration in its package.json file)';
              }
              output+='\nError from adapter:\n'+ errMsg+'\n\n';


              // Recommend installation of the session adapter:
              output += 'Do you have the Connect session adapter installed in this project?\n';
              output += 'Try running the following command in your project\'s root directory:\n';
              var installRecommendation = 'npm install ';
              if (adapter === 'connect-redis') {
                installRecommendation += 'connect-redis@1.4.5';
                installRecommendation += '\n(Note that `connect-redis@1.5.0` introduced breaking changes- make sure you have v1.4.5 installed!)';
              }
              else {
                installRecommendation += adapter;
                installRecommendation +='\n(Note: Make sure the version of the Connect adapter you install is compatible with Express 3/Sails v0.10)';
              }
              installRecommendation += '\n';

              output += installRecommendation;

              return output;
            };

            try {

              // Determine the path to the adapter by using the "main" described in its package.json file:
              var pathToAdapterDependency;
              var pathToAdapterPackage = path.resolve(app.config.appPath, 'node_modules', sessionConfig.adapter ,'package.json');
              var adapterPackage;
              try {
                adapterPackage = require(pathToAdapterPackage);
                pathToAdapterDependency = path.resolve(app.config.appPath, 'node_modules', sessionConfig.adapter, adapterPackage.main);
              }
              catch (e) {
                return cb(COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR(sessionConfig.adapter, adapterPackage, e));
              }
              var SessionAdapter = require(pathToAdapterDependency);
              var CustomStore = SessionAdapter(require('express'));
              sessionConfig.store = new CustomStore(sessionConfig);
            } catch (e) {
              // TODO: negotiate error and give better error msg depending on code
              return cb(COULD_NOT_REQUIRE_CONNECT_ADAPTER_ERR(sessionConfig.adapter, adapterPackage, e));
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

      // e.g. "sails.sid"
      var sessionKey = app.config.session.key;

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
      return app.config.session.store.get(sessionId, function (err, session){
        if (err) return cb(err);
        if (!session) {
          return cb((function _createError(){
            var e = new Error('Session could not be loaded');
            e.code = 'E_SESSION';
            return e;
          })());
        }
        return cb(null, session);
      });
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
      return app.config.session.store.set(sessionId, data, function (err){
        if (err) return cb(err);
        return app.config.session.store.get(sessionId, function (err, session) {
          if (err) return cb(err);
          if (!session) {
            return cb((function _createError(){
              var e = new Error('Session could not be saved');
              e.code = 'E_SESSION';
              return e;
            })());
          }
          return cb(null, session);
        });
      });
    },


    // /**
    //  * Generate a new Session instance and return it.
    //  *
    //  * @param {Function} cb
    //  *
    //  * @api private
    //  */
    // generate: function (cb) {

    //   if (typeof cb !== 'function') {
    //     app.log.error('Failed to generate session- expected callback function as argument.\nUsage:\nsails.session.generate(callback)');
    //     return;
    //   }

    //   var newSession;

    //   try {
    //     // Generate a new session instance (and a new sid)
    //     // (
    //     //  1st arg to constructor (sort of a pretend `req` object, but mainly just to get headers)
    //     //  2nd argument is a cookie config object
    //     // )
    //     newSession = new ConnectSession({headers:{}}, {
    //       cookie: {
    //         // Prevent access from client-side javascript
    //         httpOnly: true,

    //         // Restrict to path
    //         path: '/'
    //       }
    //     });

    //     // Next, persist the new session
    //     app.session.set(newSession.id, newSession, function(err) {
    //       if (err) return cb(err);
    //       sails.log.verbose('Generated new session (sid=', newSession.id, ') for virtual request....');

    //       // Pass back final session object
    //       return cb(null, session);
    //     });
    //   }
    //   // If new session instance cannot be created for some reason, bail out.
    //   catch (e){
    //     return cb((function _createError(){
    //       var err = new Error('Could not generate new session for virtual request');
    //       err.code = 'E_SESSION';
    //       return err;
    //     })());
    //   }

    // }
  };


  return SessionHook;
};
