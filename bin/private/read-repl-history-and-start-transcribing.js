/**
 * Module dependencies
 */

var fs = require('fs');


/**
 * readReplHistoryAndBeginTranscribing()
 *
 * Load from a REPL history file, then bind notifier functions to
 * track history-making events as changes occur in the future.
 *
 * > Originally based on https://github.com/tmpvar/repl.history
 *
 * @param {Ref} repl
 *        An already-started REPL instance.
 *
 * @param {String} file
 *        The absolute path to the `.node_history` file to use.
 */

module.exports = function readReplHistoryAndBeginTranscribing(repl, file) {

  // Check that the REPL history file exists.
  var historyFileExists = fs.existsSync(file);
  if (historyFileExists) {

    // If so, then read it, and set the initial REPL history.
    repl.rli.history = fs.readFileSync(file, 'utf-8').split('\n').reverse();
    repl.rli.history.shift();
    repl.rli.historyIndex = -1;

  }//>-

  // Attempt to open the history file.
  var fd = fs.openSync(file, 'a');

  // Bind alistener that will fire each time a newline is entered on the REPL.
  repl.rli.addListener('line', function (code) {

    // Update the REPL history file accordingly.
    if (code && code !== '.history') {
      fs.write(fd, code + '\n', function (err){
        // Do nothing.
      });
    }
    else {
      repl.rli.historyIndex++;
      repl.rli.history.pop();
    }

  });//</every time repl.rli emits a "line" event>

  // Bind a one-time-use listener that will fire when the process exits.
  process.once('exit', function () {

    // Close the history file.
    fs.closeSync(fd);

  });//</when process emits "exit">

};
