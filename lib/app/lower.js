/**
 * Module dependencies.
 */

var _ = require('@sailshq/lodash');
var async = require('async');


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

module.exports = function lower(options, cb) {
  var sails = this;

  sails.log.verbose('Lowering sails...');

  // `options` is optional.
  if (_.isFunction(options)) {
    cb = options;
    options = undefined;
  }

  // Callback is optional
  cb = cb || function(err) {
    if (err)  { return sails.log.error(err); }
  };

  options = options || {};
  options.delay = options.delay || 100;

  // Flag `sails._exiting` as soon as the app has begun to shutdown.
  // This may be used by core hooks and other parts of core.
  // (e.g. to stop handling HTTP requests and prevent ugly error msgs)
  sails._exiting = true;

  var beforeShutdown = (sails.config && sails.config.beforeShutdown) || function(cb) {
    return cb();
  };

  // Wait until beforeShutdown logic runs
  beforeShutdown(function(err) {

    // If an error occurred, don't stop-- still go ahead and take care of other teardown tasks.
    if (err) {
      sails.log.error(err);
    }

    // Try to kill all child processes
    _.each(sails.childProcesses, function kill(childProcess) {
      sails.log.silly('Sent kill signal to child process (' + childProcess.pid + ')...');
      try {
        childProcess.kill('SIGINT');
      } catch (e) {
        sails.log.error('While lowering Sails app: received error killing child process:', e.stack);
      }
    });

    // Shut down HTTP server
    sails.emit('lower');
    // (Note for future: would be cleaner to provide a way to defer this to the http
    // and sockets hooks-- i.e. having hooks expose a `teardown(cb)` interceptor. Keep
    // in mind we'd need a way to distinguish between a graceful shutdown and a force
    // kill.  In a force kill situation, it's never ok for the process to hang.)

    async.series([

      function shutdownSockets(cb) {

        // If the sockets hook is disabled, skip this.
        // Also skip if the socket server is piggybacking on the main HTTP server, to avoid
        // the onClose event possibly being called multiple times (because you can't tell
        // socket.io to close without it trying to close the http server).  If we're piggybacking
        // we'll call sails.io.close in the main "shutdownHTTP" code below.
        if (!_.isObject(sails.hooks) || !sails.hooks.sockets || !sails.io || (sails.io && sails.io.httpServer && sails.hooks.http.server === sails.io.httpServer)) {
          return cb();
        }

        var timeOut;

        try {
          sails.log.silly('Shutting down socket server...');
          timeOut = setTimeout(function() {
            sails.io.httpServer.removeListener('close', onClose);
            return cb();
          }, 100);
          sails.io.httpServer.unref();
          sails.io.httpServer.once('close', onClose);
          sails.io.close();
        } catch (e) {
          sails.log.verbose('Error occurred closing socket server: ', e);
          clearTimeout(timeOut);
          return cb();
        }

        function onClose() {
          sails.log.silly('Socket server shut down successfully.');
          clearTimeout(timeOut);
          cb();
        }

      },

      function shutdownHTTP(cb) {
        if (!_.isObject(sails.hooks) || !sails.hooks.http || !sails.hooks.http.server) {
          return cb();
        }

        var timeOut;

        try {
          sails.log.silly('Shutting down HTTP server...');

          // Allow process to exit once this server is closed
          sails.hooks.http.server.unref();

          // If we have a socket server and it's piggybacking on the main HTTP server, tell
          // socket.io to close now.  This may call `.close()` on the HTTP server, which will
          // happen again below, but the second synchronous call to .close() will have no
          // additional effect.  Leaving this as-is in case future versions of socket.io
          // DON'T automatically close the http server for you.
          if (sails.io && sails.io.httpServer && sails.hooks.http.server === sails.io.httpServer) {
            sails.io.close();
          }

          // If the "hard shutdown" option is on, destroy the server immediately,
          // severing all connections
          if (options.hardShutdown) {
            sails.hooks.http.destroy();
          }
          // Otherwise just stop the server from accepting new connections,
          // and wait options.delay for the existing connections to close
          // gracefully before destroying.
          else {
            timeOut = setTimeout(sails.hooks.http.destroy, options.delay);
            sails.hooks.http.server.close();
          }

          // Wait for the existing connections to close
          sails.hooks.http.server.once('close', function () {
            sails.log.silly('HTTP server shut down successfully.');
            clearTimeout(timeOut);
            cb();
          });

        } catch (e) {
          sails.log.verbose('Error occurred closing HTTP server: ', e);
          clearTimeout(timeOut);
          return cb();
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
          sails.log.debug('sails.config.process.removeAllListeners is deprecated; please remove listeners indivually!');
          process.removeAllListeners();
        }

        cb();
      },
    ], function (err) {
      if (err) {
        // This should never happen because `err` is never passed in any of the async
        // functions above.  Still, just to be safe, we set up an error log.
        sails.log.error('While lowering Sails app: received unexpected error:', err.stack);
        return cb(err);
      }

      return cb();

    });//</async.series>

  });//</beforeShutdown()>

};
