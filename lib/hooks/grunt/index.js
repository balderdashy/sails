module.exports = function(sails) {

  /**
   * Module dependencies
   */

  var _ = require('@sailshq/lodash');
  var Err = require('../../../errors');
  var path = require('path');
  var fs = require('fs');
  var ChildProcess = require('child_process');


  /**
   * Grunt hook
   *
   * A core hook for interacting with the Grunt-powered pipeline which
   * is the conventional default in all new Sails apps.
   *
   *
   * @event 'hook:grunt:loaded'
   *        Emitted when the Grunt hook has been automatically loaded by Sails core, and
   *        triggered the callback in its `initialize` function.
   *
   * @event 'hook:grunt:done'
   *        Emitted when the Grunt child process exits with a normal status code.
   *        (in development, this will not fire until the app is lowered, since grunt-contrib-watch
   *         keeps the child process active)
   *
   * @event 'hook:grunt:error'
   *        Emitted when the Grunt child process exits with a non-zero status code.
   *
   *
   * > In development, note that *neither* the `grunt:hook:done`, *nor* the `grunt:hook:done` event will
   * > fire until the app is lowered if you're using the default pipeline.
   * > (This is because `grunt-contrib-watch` keeps the child process active.)
   *
   *
   * @stability 2
   * @see http://sailsjs.org/documentation/concepts/assets
   */
  return {


    /**
     * When this hook is initialized, load this project's Grunt tasks.
     */
    initialize: function(cb) {

      sails.log.verbose('Loading app Gruntfile...');

      // Determine the proper Grunt task to run.
      var gruntTaskListName;

      // Check to see if the user has specified a grunt task list for the current environment
      // (i.e. sails.config.environment)
      //
      // Note: Your asset pipeline can also be made environment-specific by checking
      // `sails.config.environment` from within the Gruntfile itself, or any task.
      // This convenience feature exists to make it easier to drop in an environment-specific
      // task list without doing any manual config or imperative coding.
      //
      // Docs on how to work with the default Grunt asset pipeline here:
      // http://sailsjs.org/documentation/concepts/assets/default-tasks
      var pathForEnvSpecificTaskList = path.resolve( sails.config.appPath, path.join('tasks/register/',sails.config.environment + '.js') );
      if ( fs.existsSync(pathForEnvSpecificTaskList) ) {
        gruntTaskListName = sails.config.environment;
      }
      // If the environment is "production", use the "prod" tasklist (unless a "production" tasklist exists)
      else if (sails.config.environment === 'production') {
        gruntTaskListName = 'prod';
      }
      else {
        gruntTaskListName = 'default';
      }

      // Now run the appropriate Grunt task for this environment
      // (spinning up a child process)
      return this.runTask(gruntTaskListName, cb);

    },


    /**
     * `runTask()`
     *
     * Fork a Grunt child process that runs the specified task.
     *
     * @param {String} taskName
     *        The name of the Grunt task to run.
     *
     * @param {Function} cb
     *        Optional.  Fires when the Grunt task has been started (non-production) or exits successfully (in production).
     *        Note that the `grunt:hook:error` and `grunt:hook:done` events are fired regardless of whether
     *        a callback is provided or not. Also note that this callback is not precisely equivalent to the semantic
     *        of these two events (for backwards compatibility).
     *
     * @api private
     *      (however note that this is called directly by `sails www` in the CLI)
     */
    runTask: function(taskName, cb_afterTaskStarted) {

      // Determine the path to the root directory of the current running instance
      // of Sails core.
      var pathToSails = path.resolve(__dirname, '../../../');

      // If provided task is not a string, fail silently.
      // TODO: handle this more elegantly-- leaving this in as-is to ensure backwards compatiblity,
      // but it should be replaced in a subsequent release with an error instead (b/c )
      if (!taskName) {
        taskName = '';
      }

      // Fork Grunt child process
      var child = ChildProcess.fork(

        // Set our Grunt wrapper file in Sails core as the working directory for
        // the Grunt child process.
        path.join(__dirname, 'grunt-wrapper.js'),

        // Command-line arguments (e.g. `foo bar`) and command-line options (e.g. `--foo="bar"`)
        // to pass to the child process.
        [
          taskName,
          '--pathToSails=' + pathToSails,

          // Backwards compatibility for v0.9.x
          '--gdsrc=' + pathToSails + '/node_modules'
        ],

        // Command-line options (e.g. `--foo="bar"`) to pass to the child process.
        {
          silent: true,
          stdio: 'pipe',
          // Pass all current node process arguments to the child process,
          // except the debug-related arguments, see issue #2670
          execArgv: process.execArgv.slice(0).filter(function(param) {
            return !(new RegExp('--debug(-brk=[0-9]+)?').test(param));
          })
        }
      );


      // Initialize local variables which will be used to buffer the
      // incoming output from our Grunt child process.
      //
      // `errorMsg` will end up holding the human-readable error message,
      // while `stackTrace` will end up with our best guess at a reasonable
      // stack trace parsed from the incoming child proc output.
      var errorMsg = '';
      var stackTrace = '';


      // Receive output as it comes in from the child proc's stdout
      // (e.g. when Grunt does `console.log()`)
      child.stdout.on('data', function(consoleMsg) {

        // store all the output
        consoleMsg = consoleMsg.toString();
        errorMsg += consoleMsg;

        // Clean out all the whitespace
        var trimmedStackTrace = (typeof stackTrace === 'string') ? stackTrace : '';
        trimmedStackTrace = trimmedStackTrace.replace(/[\n\s]*$/, '');
        trimmedStackTrace = trimmedStackTrace.replace(/^[\n\s]*/, '');
        var trimmedConsoleMsg = (typeof consoleMsg === 'string') ? consoleMsg : '';
        trimmedConsoleMsg = trimmedConsoleMsg.replace(/[\n\s]*$/, '');
        trimmedConsoleMsg = trimmedConsoleMsg.replace(/^[\n\s]*/, '');

        // Remove '--force to continue' message since it makes no sense
        // in this context:
        trimmedConsoleMsg = trimmedConsoleMsg.replace(/Use --force to continue\./i, '');
        trimmedStackTrace = trimmedStackTrace.replace(/Use --force to continue\./i, '');

        // Find the stack trace related to this warning
        stackTrace = errorMsg.substring(errorMsg.lastIndexOf('Running "'));

        // Handle fatal errors, like missing grunt dependency, etc.
        if (consoleMsg.match(/Fatal error/g)) {

          // If no Gruntfile exists, don't crash- just display a warning.
          if (consoleMsg.match(/Unable to find Gruntfile/i)) {
            sails.log.info('Gruntfile could not be found.');
            sails.log.info('(no grunt tasks will be run.)');

            // In production, we consider this the end and trigger the callback if provided.
            // (otherwise, we've already triggered the callback at this point, when the task started)
            if (sails.config.environment === 'production') {
              if (_.isFunction(cb_afterTaskStarted)) {  return cb_afterTaskStarted();  }
              else { sails.log.verbose('`runTask()` could not find a Gruntfile.'); }
            }
            return;
          } // </console message contains "Unable to find Gruntfile">

          // Otherwise this is some other kind of fatal error, so log it as a "Grunt aborted" error.
          else {
            Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
            return;
          }

        } // </console message contains "Fatal error">

        // Handle fatal Grunt errors by killing Sails process as well:
        ////////////////////////////////////////////////////////////////////
        //
        // "Aborted due to warnings"
        else if (consoleMsg.match(/Aborted due to warnings/)) {
          sails.log.error('** Grunt :: An error occurred. **');
          // sails.log.warn(trimmedStackTrace);
          // sails.emit('hook:grunt:error', trimmedStackTrace);
          Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
          return;
        } // </console message contains "Aborted due to warnings">

        // "Warning: EMFILE"
        else if (consoleMsg.match(/EMFILE/ig)){
          sails.log.error('** Grunt :: An EMFILE error occurred. **');
          sails.log.error(
            'Usually this means there are too many files open as per your system settings.\n'+
            'If you are developing on one of the many unix-based operating systems that has\n'+
            'the `ulimit` command, then you might try running: `ulimit -n 1024`.  For more tips,\n'+
            'see https://github.com/balderdashy/sails/issues/3523#issuecomment-175922746.\n'+
            '(command[⌘]+double-click to open links in the terminal)'
          );
          Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
          return;
        } // </console message contains "Warning: EMFILE">

        // "ParseError"
        else if (consoleMsg.match(/ParseError/)) {
          sails.log.warn('** Grunt :: Parse Warning **');
          sails.log.warn(trimmedStackTrace);
        } // </console message contains "ParseError">

        // Only display console message if it has content besides whitespace
        //////////////////////////////////////////////////////////////////
        else if (!consoleMsg.match(/^\s*$/)) {
          sails.log.verbose('Grunt :: ' + trimmedConsoleMsg);
        } // </console message has content which is not whitespace>

      }); // </ stdout.on('data') >


      // Handle errors on the stdout stream
      // (rare- this is mainly to prevent throwing and crashing the process)
      child.stdout.on('error', function(gruntOutput) {
        sails.log.error('Grunt ::', _sanitize(gruntOutput));
      }); //</on stdout error>

      // Receive output from the proc's stderr stream.
      // (e.g. when Grunt does `console.error()`)
      child.stderr.on('data', function(gruntOutput) {
        gruntOutput = _sanitize(gruntOutput);
        // Ignore the "debugger listening" message from node --debug
        if (gruntOutput.match(/debugger listening on port/)) {
          return;
        }
        // Any other stderr output gets logged using `sails.log.error`.
        else {
          sails.log.error('Grunt ::', gruntOutput);
        }
      }); //</on stderr data>

      // Handle errors on the stderr stream.
      // (rare- this is mainly to prevent throwing and crashing the process)
      child.stderr.on('error', function(gruntOutput) {
        sails.log.error('Grunt ::', _sanitize(gruntOutput));
      }); //</on stderr error>


      // When Grunt child process exits, fire event on `sails` app object.
      child.on('exit', function(code) {

        // If this is a non-zero status code, emit the 'hook:grunt:error' event.
        if (code !== 0) {
          // (in production, the callback is called in the appropriate spots above, so
          //  it does not need to be triggered again here)
          // --TODO: make this implementation simpler!  It'll be a breaking change.--
          return sails.emit('hook:grunt:error');
        }

        // Otherwise emit 'hook:grunt:done'
        sails.emit('hook:grunt:done');

        // Note that, if we're in a production environment, we wait until the Grunt
        // child process actually exits (Grunt task finishes running) before firing
        // the callback passed in to `runTask`.
        // (if this is not production, then we already fired the callback when the
        //  task was first run)
        if (sails.config.environment === 'production') {
          if (_.isFunction(cb_afterTaskStarted)) { return cb_afterTaskStarted(); }
          else { sails.log.verbose('`runTask()` has finished the Grunt task.'); }
        }
      }); //</when child process exits>

      // Since there could be long-running tasks like `grunt-contrib-watch` involved,
      // we'll want the ability to flush our child process later.
      // So we save a reference to it on `sails.childProcesses`.
      sails.log.verbose('Tracking new grunt child process...');
      if (!_.isArray(sails.childProcesses)) {
        var consistencyViolationErr = new Error(
        'Consistency violation: `sails.childProcesses` should exist and be an array.  ' +
        'Instead it\'s type: `' + typeof sails.childProcesses + '` '+
        'This means that either a custom hook or app code has damaged the `sails.childProcesses` array, '+
        'or there is a bug in Sails core.  If you expect the latter, please file an issue in the GitHub repo.'
        );
        if (_.isFunction(cb_afterTaskStarted)) {  return cb_afterTaskStarted(consistencyViolationErr);  }
        else { sails.log.error(consistencyViolationErr); }
      }
      sails.childProcesses.push(child);


      // Now that the child process is chugging along, if we are NOT in a production
      // environment, we'll go ahead and fire our callback (since Grunt might just be sitting
      // here backgrounded, assuming the conventional default pipeline is being used with
      // grunt-contrib-watch.)
      //
      // Note that, if we were in a production environment, we'd wait until the Grunt
      // child proc actually finished running before firing our callback.  But we go ahead
      // and fire it here.
      if (sails.config.environment !== 'production') {
        if (_.isFunction(cb_afterTaskStarted)) {  return cb_afterTaskStarted();  }
        else { sails.log.verbose('`runTask()` has started the Grunt task.'); }
      }
    }
  };
};


/**
 * After ensuring a chunk is a string, trim any leading or
 * trailing whitespace.  If chunk cannot be nicely casted to a string,
 * pass it straight through.
 *
 * TODO: use `util.inspect()` and/or `rttc.compile()`to squeeze better string output out of non-strings.
 * TODO: when Lodash is upgraded, use `_.trim()`
 *
 * @param  {*} chunk
 * @return {*}
 */
function _sanitize(chunk) {

  if (chunk && typeof chunk === 'object' && chunk.toString) {
    chunk = chunk.toString();
  }
  if (typeof chunk === 'string') {
    chunk = chunk.replace(/^[\s\n]*/, '');
    chunk = chunk.replace(/[\s\n]*$/, '');
  }
  return chunk;
}
