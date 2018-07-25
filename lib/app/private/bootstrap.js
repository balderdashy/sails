/**
 * Module dependencies
 */

var STRIP_COMMENTS_RX = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;



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
  // (just in case user forgot to call THEIR bootstrap's `done` callback, if
  // they're using that approach)
  var timeoutMs = sails.config.bootstrapTimeout || 5000;
  var timer = setTimeout(function bootstrapTookTooLong() {
    sails.log.warn(
    'Bootstrap is taking a while to finish ('+timeoutMs+' milliseconds).\n'+
    'If this is unexpected, and *if* the bootstrap function uses a callback,\n'+
    'maybe double-check to be sure that callback is getting called.\n'+
    ' [?] Read more: https://sailsjs.com/config/bootstrap');
  }, timeoutMs);

  var ranBootstrapFn = false;
  (function(proceed){
    try {
      var seemsToExpectCallback = true;
      if (sails.config.implementationSniffingTactic === 'analogOrClassical') {
        var hasParameters = (function(fn){
          var fnStr = fn.toString().replace(STRIP_COMMENTS_RX, '');
          var parametersAsString = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')'));
          // console.log('::',parametersAsString, parametersAsString.replace(/\s*/g,'').length);
          return parametersAsString.replace(/\s*/g,'').length !== 0;
        })(sails.config.bootstrap);//†
        seemsToExpectCallback = hasParameters;
      }
      if (sails.config.bootstrap.constructor.name === 'AsyncFunction') {
        var promise;
        if (seemsToExpectCallback) {
          promise = sails.config.bootstrap(proceed);
        } else {
          promise = sails.config.bootstrap(function(unusedErr){
            proceed(new Error('Unexpected attempt to invoke callback.  Since this "bootstrap" function does not appear to expect a callback parameter, this stub callback was provided instead.  Please either explicitly list the callback parameter among the arguments or change this code to no longer use a callback.'));
          })
          .then(function(){
            proceed();
          });
        }//ﬁ
        promise.catch(function(e) {
          proceed(e);
          // (Note that we don't do `return proceed(e)` here.  That's on purpose--
          // to avoid sending the wrong idea to you, dear reader)
        });
      }
      else {
        if (seemsToExpectCallback) {
          sails.config.bootstrap(proceed);
        } else {
          sails.config.bootstrap(function(unusedErr){
            proceed(new Error('Unexpected attempt to invoke callback.  Since this "bootstrap" function does not appear to expect a callback parameter, this stub callback was provided instead.  Please either explicitly list the callback parameter among the arguments or change this code to no longer use a callback.'));
          });
          return proceed();
        }
      }
    } catch (e) { return proceed(e); }
  })(function (err){
    if (ranBootstrapFn) {
      if (err) {
        sails.log.error('The bootstrap function encountered an error *AFTER* it already ran once!  Details:',err);
      }
      else {
        sails.log.error('The bootstrap function (`sails.config.bootstrap`) signaled that it is finished, but it already ran once!  (*If* it is using a callback, check that the callback is not being called more than once.)');
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
