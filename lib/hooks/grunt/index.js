module.exports = function (sails) {

  /**
   * Module dependencies
   */

  var Err = require('../../../errors'),
    path  = require('path'),
    ChildProcess = require('child_process');


  return {


    /**
     * Initialize this project's Grunt tasks
     * and execute the environment-specific gruntfile
     *
     */
    initialize: function (cb) {

      sails.log.verbose('Loading app Gruntfile...');

      // Start task depending on environment
      if(sails.config.environment === 'production'){
        return this.runTask('prod', cb);
      }

      this.runTask('default', cb);
    },


    /**
     * Fork Grunt child process
     *
     * @param {String} taskName - grunt task to run
     * @param {Function} cb - optional, fires when the Grunt task has been started (non-production) or finished (production)
     */
    runTask: function (taskName, cb_afterTaskStarted) {
      cb_afterTaskStarted = cb_afterTaskStarted || function () {};

      var environment = sails.config.environment;
      var pathToSails = path.resolve(__dirname, '../../../');

      // Only relevant in a development environment:
      // (unfortunately, cannot use sails.getBaseurl() because it is not calculatable yet)
      var baseurl = 'http://' + (sails.config.host || 'localhost') + ':' + sails.config.port;

      if (!taskName) {
        taskName = '';
      }

      // Fork Grunt child process
      var child = ChildProcess.fork(

        // cwd for child process
        path.join(pathToSails,'node_modules/grunt-cli/bin/grunt'),

        // cmd args+opts for child process
        [
          taskName,
          '--pathToSails='+pathToSails,

          // Backwards compatibility for v0.9.x
          '--gdsrc='+ pathToSails + '/node_modules'
        ],

        // opts to pass to node's `child_process` logic
        {
          silent: true,
          stdio: 'pipe'
        }
      );


      var errorMsg = '';
      var stackTrace = '';

      // Log output as it comes in to the appropriate log channel
      child.stdout.on('data', function (consoleMsg) {

        // store all the output
        consoleMsg = consoleMsg.toString();
        errorMsg += consoleMsg;

        // Clean out all the whitespace
        var trimmedStackTrace = (typeof stackTrace === 'string') ? stackTrace : '';
        trimmedStackTrace = trimmedStackTrace.replace(/[\n\s]*$/,'');
        trimmedStackTrace = trimmedStackTrace.replace(/^[\n\s]*/,'');
        var trimmedConsoleMsg = (typeof consoleMsg === 'string') ? consoleMsg : '';
        trimmedConsoleMsg = trimmedConsoleMsg.replace(/[\n\s]*$/,'');
        trimmedConsoleMsg = trimmedConsoleMsg.replace(/^[\n\s]*/,'');

        // Remove '--force to continue' message since it makes no sense
        // in this context:
        trimmedConsoleMsg = trimmedConsoleMsg.replace(/Use --force to continue\./i, '');
        trimmedStackTrace = trimmedStackTrace.replace(/Use --force to continue\./i, '');

        // Find the Stack Trace related to this warning
        stackTrace = errorMsg.substring(errorMsg.lastIndexOf('Running "'));

    //     if (consoleMsg.match(/Use --force to continue/)) {
        // //   sails.log.warn('** Grunt :: Warning **');
        // //   sails.log.warn(errorMsg,trimmedStackTrace);
        // }

        // Handle fatal errors, like missing grunt dependency, etc.
        if (consoleMsg.match(/Fatal error/g)) {

          // If no Gruntfile exists, don't crash- just display a warning.
          if (consoleMsg.match(/Unable to find Gruntfile/i)) {
            sails.log.info('Gruntfile could not be found.');
            sails.log.info('(no grunt tasks will be run.)');
            if(sails.config.environment === 'production'){
              cb_afterTaskStarted();
            }
            return;
          }

          Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
          return;
        }

        // Handle fatal Grunt errors by killing Sails process as well
        if (consoleMsg.match(/Aborted due to warnings/)) {
          sails.log.error('** Grunt :: An error occurred. **');
          // sails.log.warn(trimmedStackTrace);
          // sails.emit('hook:grunt:error', trimmedStackTrace);
          Err.fatal.__GruntAborted__(trimmedConsoleMsg, trimmedStackTrace);
          return;
        }

        if (consoleMsg.match(/ParseError/)) {
          sails.log.warn('** Grunt :: Parse Warning **');
          sails.log.warn(trimmedStackTrace);
        }

        // Only display console message if it has content besides whitespace
        else if ( !consoleMsg.match(/^\s*$/) ) {
          sails.log.verbose('Grunt :: ' + trimmedConsoleMsg);
        }
      });

      // Handle general-case grunt output:
      child.stdout.on('error', function (gruntOutput) {
        sails.log.error('Grunt ::', _sanitize(gruntOutput));
      });
      child.stderr.on('data', function (gruntOutput) {
        gruntOutput = _sanitize(gruntOutput);
        // Ignore the "debugger listening" message from node --debug
        if (gruntOutput.match(/debugger listening on port/)) {
          return;
        }
        sails.log.error('Grunt ::', gruntOutput);
      });
      child.stderr.on('error', function (gruntOutput) {
        sails.log.error('Grunt ::', _sanitize(gruntOutput));
      });

      // When process is complete, fire event on `sails`
      child.on('exit', function (code, s) {
        if ( code !== 0 ) return sails.emit('hook:grunt:error');
        sails.emit('hook:grunt:done');

        // Fire finish after grunt is done in production
        if(sails.config.environment === 'production'){
          cb_afterTaskStarted();
        }
      });

      // Since there's likely a watch task involved, and we may need
      // to flush the whole thing, we need a way to grab hold of the child process
      // So we save a reference to it
      sails.log.verbose('Tracking new grunt child process...');
      sails.childProcesses.push(child);

      // Go ahead and get out of here, since Grunt might sit there backgrounded
      if(sails.config.environment !== 'production'){
         cb_afterTaskStarted();
      }
    }
  };
};


/**
 * After ensuring a chunk is a string, trim any leading or
 * trailing whitespace.  If chunk cannot be nicely casted to a string,
 * pass it straight through.
 *
 * @param  {*} chunk
 * @return {*}
 */
function _sanitize (chunk) {

  if (chunk && typeof chunk === 'object' && chunk.toString) {
    chunk = chunk.toString();
  }
  if (typeof chunk === 'string') {
    chunk = chunk.replace(/^[\s\n]*/, '');
    chunk = chunk.replace(/[\s\n]*$/, '');
  }
  return chunk;
}
