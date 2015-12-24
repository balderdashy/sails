#!/usr/bin/env node


/**
 * Module dependencies
 */

var nodepath = require('path');
var REPL = require('repl');
var fs = require('fs');
var _ = require('lodash');
require('colors');
var CaptainsLog = require('captains-log');
var Sails = require('../lib/app');
var rconf = require('../lib/app/configuration/rc');
var Err = require('../errors');



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
 */

module.exports = function() {

  var log = CaptainsLog(rconf.log);

  console.log();
  log.info('Starting app in interactive mode...'.debug);
  console.log();

  // Now load up sails for real
  var sails = Sails();
  sails.lift(_.merge({}, rconf, {

    // Disable ASCII ship to keep from dirtying things up
    log: {
      noShip: true
    }
  }), function(err) {
    if (err) {
      return Err.fatal.failedToLoadSails(err);
    }

    log.info('Welcome to the Sails console.');
    log.info(('( to exit, type ' + '<CTRL>+<C>' + ' )').grey);
    console.log();

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

  });
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
