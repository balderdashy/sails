/**
 * Module dependencies
 */

var util = require('util');


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
  // Otherwise, do nothing and continue
  if (!sails.config.bootstrap) {
    return cb();
  }

  sails.log.verbose('Running the setup logic in `sails.config.bootstrap(cb)`...');

  // IF bootstrap takes too long, display warning message
  // (just in case user forgot to call their bootstrap's `cb`)
  var timeoutMs = sails.config.bootstrapTimeout || 2000;
  var timer = setTimeout(function bootstrapTookTooLong() {
    sails.log.warn(util.format(
    'Bootstrap is taking unusually long to execute its callback (%d milliseconds).\n'+
    'Perhaps you forgot to call it?  The callback is the first argument of the function, `cb`.',
    timeoutMs));
  }, timeoutMs);

  var ranBootstrapFn = false;

  try {
    return sails.config.bootstrap(function bootstrapDone(err) {
      if (ranBootstrapFn) {
        sails.log.error('You called the callback in `sails.config.boostrap` more than once!');
        return;
      }
      ranBootstrapFn = true;
      clearTimeout(timer);
      return cb(err);
    });
  }
  catch (e) {
    if (ranBootstrapFn) {
      sails.log.error('The bootstrap function threw an error after its callback was called ::',e);
      return;
    }
    ranBootstrapFn = true;
    clearTimeout(timer);
    return cb(e);
  }

};
