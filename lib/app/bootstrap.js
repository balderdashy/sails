/**
 * Module dependencies
 */


/**
 * runBootstrap
 *
 * TODO: move this into a new `bootstrap` hook so that it may be flipped
 * on and off explicitly w/o loading/depending on user config
 *
 * @param  {Function} cb [description]
 *
 * @api private
 */

module.exports = function runBootstrap(cb) {

  var sails = this;

  // Run boostrap script if specified
  if (sails.config.bootstrap) {

    sails.log.verbose('Running the setup logic in `sails.config.bootstrap(cb)`...');

    // IF bootstrap takes too long, display warning message
    // (just in case user forgot to call their bootstrap's `cb`)
    var timer = setTimeout(function bootstrapTookTooLong() {
      sails.log.warn("Bootstrap is taking unusually long to execute " +
        "its callback (" + timeoutMs + "ms).\n" +
        "Perhaps you forgot to call it?  The callback is the first argument of the function, `cb`.");
    }, sails.config.bootstrapTimeout || 2000);

    var ranBootstrapFn = false;
    sails.config.bootstrap(function bootstrapDone(err) {
      if (ranBootstrapFn) {
        sails.log.error('You called the callback in `sails.config.boostrap` more than once!');
      }
      ranBootstrapFn = true;
      clearTimeout(timer);
      return cb(err);
    });
  }

  // Otherwise, do nothing and continue
  else cb();

};
