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
 * @param  {Function} done [description]
 *
 * @api private
 */

module.exports = function runBootstrap(done) {

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
    return done();
  }

  sails.log.verbose('Running the setup logic in `sails.config.bootstrap(done)`...');

  // If bootstrap takes too long, display warning message
  // (just in case user forgot to call THEIR bootstrap's `done` callback)
  var timeoutMs = sails.config.bootstrapTimeout || 5000;
  var timer = setTimeout(function bootstrapTookTooLong() {
    sails.log.warn(util.format(
    'Bootstrap is taking a while to execute its callback (%d milliseconds).\n'+
    'If this is unexpected, maybe double-check it\'s getting called.\n'+
    'https://sailsjs.com/config/bootstrap',
    timeoutMs));
  }, timeoutMs);

  var ranBootstrapFn = false;
  (function(proceed){
    try {
      if (sails.config.bootstrap.constructor.name === 'AsyncFunction') {
        var promise = sails.config.bootstrap(proceed);
        // Note that here, we don't write in the usual `return done(e)` style.
        // This is deliberate -- to provide a conspicuous reminder that we aren't
        // trying to get up to any funny business with the promise chain.
        promise.catch(function(e) {
          proceed(e);
          // (Note that we don't do `return proceed(e)` here.  That's on purpose--
          // to avoid sending the wrong idea to you, dear reader)
        });
      }
      else {
        sails.config.bootstrap(proceed);
      }
    } catch (e) { return proceed(e); }
  })(function (err){
    if (ranBootstrapFn) {
      if (err) {
        sails.log.error('The bootstrap function encountered an error *AFTER* calling its callback!  Details:',err);
      }
      else {
        sails.log.error('The bootstrap function (`sails.config.bootstrap`) called its callback more than once!');
      }
      return;
    }//-•
    ranBootstrapFn = true;
    clearTimeout(timer);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Note that async+await+bluebird+Node 8 errors are not necessarily "true" Error instances,
    // as per _.isError() anyway (see https://github.com/node-machine/machine/commits/6b9d9590794e33307df1f7ba91e328dd236446a9).
    // So if we want improve the stack trace here, we'd have to be a bit more relaxed and tolerate
    // these sorts of "errors" directly as well (by tweezing out the `cause`, which is where the
    // original Error lives.)
    // FUTURE: try that out
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    return done(err);

  });//</ self-calling function >

};
