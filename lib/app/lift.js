/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var async = require('async');
var chalk = require('chalk');

/**
 * Sails.prototype.lift()
 *
 * Load the app, then bind process listeners and emit the internal "ready" event.
 * The "ready" event is listened for by core hooks; for example, the HTTP hook uses
 * it to start listening for requests.
 *
 * > This method also logs the ASCII art for the characteristic ship.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {Dictionary?} configOverride
 *        Overrides that will be deep-merged (w/ precedence) on top of existing configuration.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @callback {Function?} done
 *        @param {Error?} err
 *
 * A Node-style callback that wil be triggered when the lift has completed (one way or another)
 * > If the `done` callback is omitted, then:
 * >  • If the lift fails, Sails will log the underlying fatal error using `sails.log.error()`.
 * >  • Otherwise, Sails will log "App lifted successfully." using `sails.log.verbose()`.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @api public
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function lift(configOverride, done) {

  var sails = this;

  // configOverride is optional.
  if (_.isFunction(configOverride)) {
    done = configOverride;
    configOverride = {};
  }

  // Callback is optional (but recommended.)
  done = done || function defaultCallback(err) {
    if (err) {
      sails.log.error('Failed to lift app:',err);
      sails.log.silly('(You are seeing the above error message because no custom callback was programmatically provided to `.lift()`.)');
      return;
    }

    sails.log.verbose('App lifted successfully.');
    sails.log.silly('(You are seeing the "App lifted successfully" verbose log message because no custom callback was programmatically provided to `.lift()`.)');
  };

  async.series([

    function (next) {
      sails.load(configOverride, next);
    },

    function (next){
      sails.initialize(next);
    },

  ], function whenSailsIsReady(err) {
    if (err) {
      sails.lower(function (additionalErrLoweringSails){

        if (additionalErrLoweringSails) {
          sails.log.error('When trying to lower the app as a result of a failed lift, encountered an error:', additionalErrLoweringSails);
        }//>-

        return done(err);

      });//</sails.lower>
      return;

    }//-•


    // If `config.noShip` is set, skip the startup message.
    // Otherwise, gather app meta-info and log startup message (the boat).
    if (!_.isObject(sails.config.log) || !sails.config.log.noShip) {

      sails.log.ship && sails.log.ship();
      sails.log.info(('Server lifted in `' + sails.config.appPath + '`'));

      // > Note that we don't try to include the "To see your app, visit this URL" stuff
      // > unless we're pretty sure which URL it would be a good idea to try and visit.
      // > (even then, it's not 100% or anything.  But at least with these checks, it's
      // > not wrong MOST of the time.)
      if (!sails.config.ssl && !sails.config.http.serverOptions && !sails.config.explicitHost && process.env.NODE_ENV !== 'production') {
        sails.log.info(chalk.underline('To see your app, visit http://localhost:'+sails.config.port));
      }
      sails.log.info(('To shut down Sails, press <CTRL> + C at any time.'));
      sails.log.info(('Read more at '+chalk.underline('https://sailsjs.com/support')+'.'));
      sails.log.blank();
      sails.log(chalk.grey(Array(56).join('-')));
      sails.log(chalk.grey(':: ' + new Date()));
      sails.log.blank();
      sails.log('Environment : ' + sails.config.environment);

      // Only log the host if an explicit host is set
      if (!_.isUndefined(sails.config.explicitHost)) {
        sails.log('Host        : ' + sails.config.explicitHost); // 12 - 4 = 8 spaces
      }
      sails.log('Port        : ' + sails.config.port); // 12 - 4 = 8 spaces
      sails.log.verbose('NODE_ENV  : ' + (process.env.NODE_ENV||chalk.gray('(not set)'))); // 12 - 8 - 2 = 2 spaces
      sails.log.silly();
      sails.log.silly('Version Info:');
      sails.log.silly('node        : ' + (process.version));
      sails.log.silly('engine (v8) : ' + (process.versions.v8));
      sails.log.silly('openssl     : ' + (process.versions.openssl));
      sails.log(chalk.grey(Array(56).join('-')));
    }//>-


    // Emit 'lifted' event.
    sails.emit('lifted');

    // Set `isLifted` (private dignostic flag)
    sails.isLifted = true;

    // try {console.timeEnd('core_lift');}catch(e){}

    return done(undefined, sails);

  });//</async.series()>
};


