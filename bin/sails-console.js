/**
 * Module dependencies
 */

var nodepath = require('path');
var REPL = require('repl');
var stream = require('stream');
var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var CaptainsLog = require('captains-log');

var rconf = require('../lib/app/configuration/rc')();
var Sails = require('../lib/app');
var SharedErrorHelpers = require('../errors');
var readReplHistoryAndStartTranscribing = require('./private/read-repl-history-and-start-transcribing');



/**
 * `sails console`
 *
 * Enter the interactive console (aka REPL) for the app
 * in our working directory.  This is just like the default
 * Node REPL except that it starts with the Sails app in the
 * current directory lifted, and with console history enabled
 * (i.e. so you can press up arrow to browse and potentially
 *  replay commands from past runs)
 *
 * @stability 3
 * @see http://sailsjs.com/documentation/reference/command-line-interface/sails-console
 * ------------------------------------------------------------------------
 * This lifts the Sails app in the current working directory, then uses
 * the core `repl` package to spin up an interactive console.
 *
 * Note that, if `--dontLift` was set, then `sails.load()` will be used
 * instead. (By default, the `sails console` cmd runs `sails.lift()`.)
 * ------------------------------------------------------------------------
 */

module.exports = function() {

  // Get a temporary logger just for use in `sails console`.
  // > This is so that logging levels are configurable, even when a
  // > Sails app hasn't been loaded yet.
  var cliLogger = CaptainsLog(rconf.log);

  // Now grab our dictionary of configuration overrides to pass in
  // momentarily when we lift (or load) our Sails app.  This is the
  // dictionary of configuration settings built from `.sailsrc` file(s),
  // command-line options, and environment variables.
  // (No need to clone, since, even through we're modifying it below,
  //  it's not being used anywhere else.)
  var configOverrides = rconf;

  // Then tweak this configuration to make sure we always disable
  // the ASCII ship.  It just doesn't look good in the REPL.
  if (!_.isObject(configOverrides.log)) {
    configOverrides.log = {};
  }
  configOverrides.log.noShip = true;

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

  console.log();
  if (configOverrides.dontLift) {
    cliLogger.info(chalk.blue('Loading app in interactive mode...'));
    cliLogger.info(chalk.gray('Sails is not listening for requests (since `dontLift` was enabled).'));
    cliLogger.info(chalk.gray('You still have access to your models, helpers, and `sails`.'));
  }
  else {
    cliLogger.info(chalk.blue('Starting app in interactive mode...'));
  }
  console.log();

  // Lift (or load) Sails
  (function _loadOrLift(proceed){

    // If `--dontLift` was set, then use `.load()` instead.
    if (configOverrides.dontLift) {
      sailsApp.load(configOverrides, proceed);
    }
    // Otherwise, go with the default behavior (`.lift()`)
    else {
      sailsApp.lift(configOverrides, proceed);
    }

  })(function afterwards(err){// ~∞%°
    if (err) {
      return SharedErrorHelpers.fatal.failedToLoadSails(err);
    }

    // Get the current global _ value, if any.
    var underscore = global._;

    cliLogger.info('Welcome to the Sails console.');
    cliLogger.info(chalk.grey('( to exit, type ' + '<CTRL>+<C>' + ' )'));
    console.log();

    // Define a custom output stream that will replace global._ after every command.
    // This works around the issue where the Node REPL uses the underscore to hold
    // the result of the last command.
    var outputStream = (function() {
      // Create a new writable stream.
      var writableStream = new stream.Writable();
      // Add the `_write` method to it (can't do this in the constructor b/c that's not supported in older Node versions).
      writableStream._write = function(chunk, encoding, callback) {
        // Ignore the output generated the first time the global _ is set in Node 6+.
        if (chunk.toString('utf8').indexOf('Expression assignment to _ now disabled.') !== -1) {
          return callback();
        }
        // Set the global underscore again (for Node < 6).
        // See code after `REPL.start` for more info.
        if (typeof underscore !== 'undefined') {
          global._ = underscore;
        }
        // Forward the chunk on to stdout.
        process.stdout.write(chunk, encoding, callback);
      };
      // Return the new writable stream.
      return writableStream;
    })();

    // Start a REPL.
    var repl = REPL.start({
      // Set the REPL prompt.
      prompt: 'sails> ',
      // Allow the REPL to use the same global space as the Sails app, giving it access
      // to things like globalized models.
      useGlobal: true,
      // Specify the custom output stream we created above.
      output: outputStream,
      // When an output stream is specified, an input stream must be specified as well
      // or else the REPL crashes.
      input: process.stdin,
      // Set `terminal` to true to allow arrow keys to work correctly,
      // even when we're using a custom output stream.  Otherwise pressing
      // the up arrow just outputs ^[[A instead of accessing history.
      terminal: true,
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: Potentially use custom `eval` as stopgap for `await` support in Node <v9
      // https://nodejs.org/api/repl.html#repl_repl_start_options
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    });

    // Replace the global _ value, if any.  This will deactivate the underscore behavior
    // in the Node REPL for Node 6+, which conflicts with the global _ in Sails apps.
    // Note that in Node 6+ this typically causes the REPL to output "Expression assignment to _ now disabled.",
    // which unfortunately gets put right next to the `sails>` prompt, making for a very confusing
    // introduction to the Sails console.  In the custom output stream we defined above, we filter out
    // that message.
    if (typeof underscore !== 'undefined') {
      global._ = underscore;
    }

    // Now attempt to read the existing REPL history file, if there is one.
    var pathToReplHistoryFile = nodepath.join(sailsApp.config.paths.tmp, '.node_history');
    try {

      // Read the REPL history file, and bind notifier functions that will listen
      // for history-making events, and keep track of them for future generations.
      readReplHistoryAndStartTranscribing(repl, pathToReplHistoryFile);

    }
    catch (e) {

      cliLogger.verbose('Encountered an error attempting to access/interpret a `.node_history` file at `'+pathToReplHistoryFile+'`.');
      cliLogger.verbose('(This session of `sails console` will still work, it just won\'t support REPL history.)');
      cliLogger.verbose('Error details:\n',e);

    }//>-

    // Bind a one-time-use handler that will run when the REPL instance emits its "exit" event.
    repl.once('exit', function(err) {

      // If an error occurred, log it, then terminate the process with an exit code of 1.
      if (err) {
        cliLogger.error(err);
        return process.exit(1);
      }// --•

      // Otherwise, everything is cool.
      // Call the core 'lower' function and terminate the process with an exit code of 0.
      sailsApp.lower(function () {
        return process.exit(0);
      });

    });//</when 'exit' event it emitted by repl instance>

  });//</after lifting or loading Sails app>

};
