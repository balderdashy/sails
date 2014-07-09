/**
 * Module dependencies
 */


/**
 * Sails.prototype.initialize()
 *
 * Start the Sails server
 * NOTE: sails.load() should be run first.
 *
 * @api private
 */

module.exports = function initialize(cb) {

  var sails = this;

  // Callback is optional
  cb = cb || function(err) {
    if (err) sails.log.error(err);
  };

  // Indicate that server is starting
  sails.log.verbose('Starting app at ' + sails.config.appPath + '...');

  //
  // Note that we give our process event listener callback functions
  // these names (like `_on_SIGTERM`) so that we can selectively `removeListener()`
  // them when the process finishes.
  //

  // Add "beforeShutdown" events
  process.once('SIGUSR2', function _on_SIGUSR2 () {
    sails.lower(function() {
      process.kill(process.pid, 'SIGUSR2');
    });
  });
  process.on('SIGINT', function _on_SIGINT () {
    sails.lower(function (){

      // Remove the process event listeners that were bound
      // in this file (leaves all other process event listeners
      // that may have been bound by other modules intact)
      process.removeListener('SIGUSR2', _on_SIGUSR2);
      process.removeListener('SIGINT', _on_SIGINT);
      process.removeListener('SIGTERM', _on_SIGTERM);
      process.removeListener('exit', _on_exit);

      process.exit();
    });
  });
  process.on('SIGTERM', function _on_SIGTERM () {
    sails.lower(function (){

      // Remove the process event listeners that were bound
      // in this file (leaves all other process event listeners
      // that may have been bound by other modules intact)
      process.removeListener('SIGUSR2', _on_SIGUSR2);
      process.removeListener('SIGINT', _on_SIGINT);
      process.removeListener('SIGTERM', _on_SIGTERM);
      process.removeListener('exit', _on_exit);

      process.exit();
    });
  });
  process.on('exit', function _on_exit() {
    if (sails._exiting) return;

    sails.lower(


    // Not sure if we need this yet or not...
    //
    // ||
    // \/
    //
    //   function () {
    //   // Remove the process event listeners that were bound
    //   // in this file (leaves all other process event listeners
    //   // that may have been bound by other modules intact)
    //   process.removeListener('SIGUSR2', _on_SIGUSR2);
    //   process.removeListener('SIGINT', _on_SIGINT);
    //   process.removeListener('SIGTERM', _on_SIGTERM);
    //   process.removeListener('exit', _on_exit);
    // }
    //
    );
  });


  // Run the app bootstrap
  sails.runBootstrap(function afterBootstrap(err) {
    if (err) {
      sails.log.error('Bootstrap encountered an error: (see below)');
      return cb(err);
    }

    // And fire the `ready` event
    // This is listened to by attached servers, etc.
    sails.emit('ready');
    cb(null, sails);
  });
};
