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

  // Flag `sails._exiting` as soon as the app has begun to shutdown.
  // This may be used by hooks and other parts of core.
  // (e.g. to stop handling HTTP requests and prevent ugly error msgs)
  sails._exiting = true;

  var beforeShutdown = (sails.config && sails.config.beforeShutdown) || function(cb) {
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

    async.series([

      function shutdownSockets(cb) {
        if (!_.isObject(sails.hooks) || !sails.hooks.sockets) {
          return cb();
        }

        try {
          sails.log.verbose('Shutting down socket server...');
          var timeOut = setTimeout(cb, 100);
          sails.io.server.unref();
          sails.io.server.close();
          sails.io.server.on('close', function() {
            sails.log.verbose('Socket server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });
        } catch (e) {
          clearTimeout(timeOut);
          cb();
        }
      },

      function shutdownHTTP(cb) {
        if (!_.isObject(sails.hooks) || !sails.hooks.http) {
          return cb();
        }

        var timeOut;

        try {
          sails.log.verbose('Shutting down HTTP server...');

          // Give the server 100ms to close all existing connections
          // and emit the "close" event.  After that, unbind our
          // "close" listener and continue (this prevents the cb
          // from being called twice).
          timeOut = setTimeout(function() {
            sails.hooks.http.server.removeListener('close', onClose);
            return cb();
          }, 100);

          // Allow process to exit once this server is closed
          sails.hooks.http.server.unref();

          // Stop the server from accepting new connections
          sails.hooks.http.server.close();

          // Wait for the existing connections to close
          sails.hooks.http.server.on('close', onClose);

        } catch (e) {
          clearTimeout(timeOut);
          cb();
        }

        function onClose() {
          sails.log.verbose('HTTP server shut down successfully.');
          clearTimeout(timeOut);
          cb();
        }
      },

      function removeListeners(cb) {
        // Manually remove all event listeners
        _.each(_.keys(sails._events)||[], function (eventName){
          sails.removeAllListeners(eventName);
        });

        var listeners = sails._processListeners;
        if (listeners) {
          process.removeListener('SIGUSR2', listeners.sigusr2);
          process.removeListener('SIGINT', listeners.sigint);
          process.removeListener('SIGTERM', listeners.sigterm);
          process.removeListener('exit', listeners.exit);
        }
        sails._processListeners = null;

        // If `sails.config.process.removeAllListeners` is set, do that.
        // This is no longer necessary due to https://github.com/balderdashy/sails/pull/2693
        // Deprecating for v0.12.
        if (sails.config && sails.config.process && sails.config.process.removeAllListeners) {
          sails.log.warn("sails.config.process.removeAllListeners is deprecated; please remove listeners indivually!");
          process.removeAllListeners();
        }

        cb();
      }
    ], cb);

  });

};
