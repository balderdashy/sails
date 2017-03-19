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

  // Track whether we've logged a warning about writing the REPL history yet.
  // (Just to avoid making everybody tear their hair out.)
  var alreadyLoggedWarningAboutREPLHistory;

  // Bind alistener that will fire each time a newline is entered on the REPL.
  repl.rli.addListener('line', function (code) {

    // Update the REPL history file accordingly.
    if (code && code !== '.history') {
      var buffer = new Buffer(code + '\n');
      // Send all arguments to fs.write to support Node v0.10.x.
      fs.write(fd, buffer, 0, buffer.length, null, function (err /*, written */){
        if (!err) {
          // If everything worked, then there's nothing to worry about.  We're done.
          return;
        }

        // Otherwise, log a warning about the REPL history.
        // (Unless the spinlock has already been spun.)
        if (alreadyLoggedWarningAboutREPLHistory) { return; }
        alreadyLoggedWarningAboutREPLHistory = true;
        console.warn('WARNING: Could not write REPL history.  Details: '+err.stack);

      });// _∏_
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
