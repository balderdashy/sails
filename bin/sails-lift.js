/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var captains = require('captains-log');

var rconf = require('../lib/app/configuration/rc')();
var Sails = require('../lib/app');
var SharedErrorHelpers = require('../errors');



/**
 * `sails lift`
 *
 * Fire up the Sails app in our working directory, using the
 * appropriate version of Sails.
 *
 * > This uses the locally-installed Sails, if available.
 * > Otherwise, it uses the currently-running Sails (which,
 * > 99.9% of the time, is the globally-installed version.)
 *
 * @stability 3
 * @see http://sailsjs.com/documentation/reference/command-line-interface/sails-lift
 */

module.exports = function() {

  // Get a temporary logger just for use in `sails lift`.
  // > This is so that logging levels are configurable, even when a
  // > Sails app hasn't been loaded yet.
  var cliLogger = captains(rconf.log);

  console.log();
  cliLogger.info(chalk.grey('Starting app...'));
  console.log();

  // Now grab our dictionary of configuration overrides to pass in
  // momentarily when we lift (or load) our Sails app.  This is the
  // dictionary of configuration settings built from `.sailsrc` file(s),
  // command-line options, and environment variables.
  // (No need to clone, since it's not being used anywhere else)
  var configOverrides = rconf;

  // Determine whether to use the local or global Sails install.
  var sailsApp = (function _determineAppropriateSailsAppInstance(){

    // Use the app's locally-installed Sails dependency (in `node_modules/sails`),
    // assuming it's extant and valid.
    // > Note that we always assume the current working directory to be the
    // > root directory of the app.
    var appPath = process.cwd();
    var localSailsPath = nodepath.resolve(appPath, 'node_modules/sails');
    if (Sails.isLocalSailsValid(localSailsPath, appPath)) {
      cliLogger.verbose('Using locally-installed Sails.');
      cliLogger.silly('(which is located at `'+localSailsPath+'`)');
      return require(localSailsPath);
    }// --•

    // Otherwise, since no workable locally-installed Sails exists,
    // run the app using the currently running version of Sails.
    // > This is probably always the global install.
    cliLogger.info('No local Sails install detected; using globally-installed Sails.');

    return Sails();

  })();

  // Lift (or load) Sails
  (function _loadOrLift(proceed){

    // If `--dontLift` was set, then use `.load()` instead.
    if (!_.isUndefined(configOverrides.dontLift)) {
      sailsApp.load(configOverrides, proceed);
    }
    // Otherwise, go with the default behavior (`.lift()`)
    else {
      sailsApp.lift(configOverrides, proceed);
    }

  })(function afterwards(err){// ~∞%°
    if (err) {
      return SharedErrorHelpers.fatal.failedToLoadSails(err);
    }// --•

    // If we made it here, the app is all lifted and ready to go.
    // The server will lower when the process is terminated-- either by a signal,
    // or via an uncaught fatal error.

  });//</after lifting or loading Sails app>

};
