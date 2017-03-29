/**
 * Module dependencies
 */

var util = require('util');


/**
 * runBootstrap()
 *
 * Run the configured bootstrap function.
 *
 * @this {SailsApp}
 *
 * @param  {Function} cb [description]
 *
 * @api private
 */

module.exports = function runBootstrap(cb) {

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // > FUTURE: Add tests that verify that the bootstrap function may
  // > be disabled or set explicitly w/o running, depending on user
  // > config. (This is almost certainly good to go already, just worth
  // > an extra test since it was mentioned specifically way back in
  // > https://github.com/balderdashy/sails/commit/926baaad92dba345db64c2ec9e17d35711dff5a3
  // > and thus was a problem that came up when shuffling things around
  // > w/ hook loading.)
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var sails = this;

  // Run bootstrap script if specified
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
    'Bootstrap is taking a while to execute its callback (%d milliseconds).\n'+
    'If this is unexpected, maybe double-check it\'s getting called.\n'+
    'https://sailsjs.com/config/bootstrap',
    timeoutMs));
  }, timeoutMs);

  var ranBootstrapFn = false;

  try {
    return sails.config.bootstrap(function bootstrapDone(err) {
      if (ranBootstrapFn) {
        sails.log.error('You called the callback in `sails.config.bootstrap` more than once!');
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
