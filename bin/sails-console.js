#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var REPL = require('repl');
var fs = require('fs');
var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var CaptainsLog = require('captains-log');
var Sails = require('../lib/app');
var rconf = require('../lib/app/configuration/rc');
var Err = require('../errors');
var package = require('../package.json');



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
 * @see http://sailsjs.org/documentation/reference/command-line-interface/sails-console
 * ------------------------------------------------------------------------
 * This lifts the Sails app in the current working directory, then uses
 * the `repl` package to spin up an interactive console.
 *
 * Note that, if `--dontLift` was set, then `sails.load()` will be used
 * instead. (By default, the `sails console` cmd runs `sails.lift()`.)
 * ------------------------------------------------------------------------
 */

module.exports = function() {

  // Get a logger
  var log = CaptainsLog(rconf.log);

  // Build initial scope, mixing-in rc config
  var scope = _.merge({
    rootPath: process.cwd(),
    sailsPackageJSON: package
  }, rconf, {

    // Disable ASCII ship to keep from dirtying things up
    log: {
      noShip: true
    }
  });

  // Assume the current working directory to be the root of the app
  var appPath = process.cwd();

  // Determine whether to use the local or global Sails install.
  var sailsApp = (function _determineAppropriateSailsAppInstance(){
    // Use the app's local Sails in `node_modules` if it's extant and valid
    var localSailsPath = nodepath.resolve(appPath, 'node_modules/sails');
    if (Sails.isLocalSailsValid(localSailsPath, appPath)) {
      return require(localSailsPath);
    } else {
      // Otherwise, if no workable local Sails exists, run the app
      // using the currently running version of Sails.  This is
      // probably always the global install.
      log.info('No local Sails install detected; using globally-installed Sails.');
      return Sails();
    }
  })();

  console.log();
  log.info(chalk.blue('Starting app in interactive mode...'));
  console.log();


  // Lift (or load) Sails
  (function _ifThenFinally(done){
    // If `--dontLift` was set, then use `.load()` instead.
    if (!_.isUndefined(scope.dontLift)) {
      sailsApp.load(scope, done);
    }
    // Otherwise, go with the default behavior (`.lift()`)
    else {
      sailsApp.lift(scope, done);
    }
  })(function afterwards(err){
    if (err) {
      return Err.fatal.failedToLoadSails(err);
    }

    log.info('Welcome to the Sails console.');
    log.info(chalk.grey('( to exit, type ' + '<CTRL>+<C>' + ' )'));
    console.log();

    // Start a REPL
    var repl = REPL.start({prompt: 'sails> ', useGlobal: true});
    try {
      history(repl, nodepath.join(sails.config.paths.tmp, '.node_history'));
    } catch (e) {
      log.verbose('Console history cannot be found.  Proceeding without it. This is due to error:', e);
    }
    repl.on('exit', function(err) {
      if (err) {
        log.error(err);
        process.exit(1);
      }
      process.exit(0);
    });

  });//</_ifThenFinally()>
};






/**
 * REPL History
 * Pulled directly from https://github.com/tmpvar/repl.history
 * with the slight tweak of setting historyIndex to -1 so that
 * it works as expected.
 */

function history(repl, file) {

  try {
    var stat = fs.statSync(file);
    repl.rli.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
    repl.rli.history.shift();
    repl.rli.historyIndex = -1;
  } catch (e) {}

  var fd = fs.openSync(file, 'a'),
    reval = repl.eval;

  repl.rli.addListener('line', function(code) {
    if (code && code !== '.history') {
      fs.write(fd, code + '\n');
    } else {
      repl.rli.historyIndex++;
      repl.rli.history.pop();
    }
  });

  process.on('exit', function() {
    fs.closeSync(fd);
  });

  repl.commands['.history'] = {
    help: 'Show the history',
    action: function() {
      var out = [];
      repl.rli.history.forEach(function(v, k) {
        out.push(v);
      });
      repl.outputStream.write(out.reverse().join('\n') + '\n');
      repl.displayPrompt();
    }
  };
}
