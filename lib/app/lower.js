/**
 * Module dependencies.
 */

var async = require('async');
var _ = require('lodash');


/**
 * Sails.prototype.lower()
 *
 * The inverse of `lift()`, this method
 * shuts down all attached servers.
 *
 * It also unbinds listeners and terminates child processes.
 *
 * @api public
 */

module.exports = function lower(cb) {
  var sails = this;

  sails.log.verbose('Lowering sails...');
  // Callback is optional
  cb = cb || function(err) {
    if (err) return sails.log.error(err);
  };
  sails._exiting = true;

  var beforeShutdown = sails.config.beforeShutdown || function(cb) {
      return cb();
    };

  // Wait until beforeShutdown logic runs
  beforeShutdown(function(err) {

    // If an error occurred, don't stop-- still try to kill the child processes.
    if (err) {
      sails.log.error(err);
    }

    // Kill all child processes
    _.each(sails.childProcesses, function kill(childProcess) {
      sails.log.verbose('Sent kill signal to child process (' + childProcess.pid + ')...');
      try {
        childProcess.kill('SIGINT');
      } catch (e) {
        sails.log.warn('Error received killing child process: ', e.message);
      }
    });

    // Shut down HTTP server
    // TODO: defer this to the http and sockets hooks-- use sails.emit('lowering')
    // Shut down Socket server
    // wait for all attached servers to stop
    sails.emit('lower');
    var log = sails.log.verbose;

    async.series([

      function shutdownSockets(cb) {
        if (!sails.hooks.sockets) {
          return cb();
        }

        try {
          log('Shutting down socket server...');
          var timeOut = setTimeout(cb, 100);
          sails.io.server.unref();
          sails.io.server.close();
          sails.io.server.on('close', function() {
            log('Socket server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });
        } catch (e) {
          clearTimeout(timeOut);
          cb();
        }
      },

      function shutdownHTTP(cb) {

        if (!sails.hooks.http) {
          return cb();
        }

        try {
          log('Shutting down HTTP server...');
          var timeOut = setTimeout(cb, 100);
          sails.hooks.http.server.unref();
          sails.hooks.http.server.close();
          sails.hooks.http.server.on('close', function() {
            log('HTTP server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });
        } catch (e) {
          clearTimeout(timeOut);
          cb();
        }
      },

      function removeListeners(cb) {
        // Manually remove all event listeners
        for (var key in sails._events) {
          sails.removeAllListeners(key);
        }

        // If `sails.config.process.removeAllListeners` is set, do that.
        if (sails.config.process && sails.config.process.removeAllListeners) {
          process.removeAllListeners();

          // TODO:
          // investigate- there is likely a more elegant way to do this.
          // Instead of doing removeAllListeners, we should be manually removing
          // those listeners that we actual attach. See the `processeventsstuff`
          // branch for some first steps in that direction. ~mm
        }

        cb();
      }
    ], cb);

  });

};
