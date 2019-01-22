/**
 * Module dependencies
 */

var nodepath = require('path');
var _ = require('@sailshq/lodash');
var captains = require('captains-log');
var rconf = require('../lib/app/configuration/rc')();
var Sails = require('../lib/app');
var SharedErrorHelpers = require('../errors');



/**
 * `sails migrate`
 *
 * Load (but don't lift) the Sails app in our working directory, using the
 * appropriate version of Sails, and skipping the Grunt hook.  Then run the
 * app's bootstrap function, and simply exit.
 *
 * (Useful for quickly running auto-migrations by hand.)
 *
 * > This uses the locally-installed Sails, if available.
 * > Otherwise, it uses the currently-running Sails (which,
 * > 99.9% of the time, is the globally-installed version.)
 *
 * Example usage:
 * ```
 * # Run "alter" auto-migrations to attempt to adjust all data
 * # (but possibly delete it)
 * sails migrate
 *
 * # Run "drop" auto-migrations to wipe all data
 * sails migrate --drop
 * ```
 *
 * @stability EXPERIMENTAL
 * @see http://sailsjs.com/documentation/reference/command-line-interface/sails-migrate
 */

module.exports = function() {

  // Get a temporary logger just for use in this file.
  // > This is so that logging levels are configurable, even when a
  // > Sails app hasn't been loaded yet.
  var cliLogger = captains(rconf.log);

  cliLogger.warn('`sails migrate` is currently experimental.');

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

  })();//†


  // Skip the grunt hook.
  // (Note that we can't really use `sails.config.loadHooks` because we don't
  // know what kinds of stuff you might be relying on in your bootstrap function.)
  //
  // > FUTURE: if no orm hook actually installed, then fail with an error
  // > explaining you can't really run auto-migrations without that.
  configOverrides = _.extend(_.clone(configOverrides), {
    hooks: _.extend(configOverrides.hooks||{}, {
      grunt: false
    }),
  });

  // Load the Sails app
  sailsApp.load(configOverrides, function(err) {
    if (err) {
      return SharedErrorHelpers.fatal.failedToLoadSails(err);
    }// --•

    // Run the app bootstrap
    sailsApp.runBootstrap(function afterBootstrap(err) {
      if (err) {
        sailsApp.log.error('Bootstrap function encountered an error during `sails migrate`: (see below)');
        sailsApp.log.error(err);
        return;
      }// --•

      // Tear down the Sails app
      sailsApp.lower();

    });//_∏_. </after running bootstrap>

  });//_∏_  </after loading Sails app>

};
