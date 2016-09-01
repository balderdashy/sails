/**
 * Module dependencies
 */

var path = require('path');
var isString = require('lodash.isstring');
var isUndefined = require('lodash.isundefined');
var isFunction = require('lodash.isfunction');
var isArray = require('lodash.isarray');
var request = require('request');
var MProcess = require('machinepack-process');


/**
 * testSpawningSailsLiftChildProcessInCwd()
 *
 * This concisely-named test helper function injects a describe block, testing how Sails fares
 * when it comes time to `sails lift` in the current working directory.
 *
 * @required  {String} pathToSailsCLI
 *         the absolute path to the Sails CLI
 *
 * @required {Array} liftCliArgs
 *           an array of additional string CLI args/opts to pass to `sails lift`
 *           (e.g. `['--prod', '--port=1331']`)
 *
 * @optional {Dictionary} httpRequestInstructions
 *           A dictionary that gets passed in to `request()` when this helper attempts
 *           to contact the Sails server running in the child process.
 *           If provided at all, this can/must contain:
 *             @required {String} method
 *             @required {String} uri
 *             @optional {String} expectedStatusCode  [defaults to 200]
 *
 * @optional {Function} fnWithAdditionalTests
 *           A function with additional custom tests; that is, it has one or more `it()` blocks inside.
 *
 * @optional {Boolean} expectFailedLift
 *           A flag which, if enabled, causes this test helper to _expect_ the lift to fail.
 *           Also if it is set AND `httpRequestInstructions` are set, then the HTTP request
 *           will still be sent-- but just to _make sure_ it fails too.
 */
module.exports = function testSpawningSailsLiftChildProcessInCwd (opts){

  if (!isArray(opts.liftCliArgs)){
    throw new Error('Consistency violation: Missing or invalid option (`liftCliArgs` should be an array)  in `testSpawningSailsLiftChildProcessInCwd()`. I may just be a test helper, but I\'m serious about assertions!!!');
  }
  if (!isString(opts.pathToSailsCLI)){
    throw new Error('Consistency violation: Missing or invalid option (`pathToSailsCLI` should be a string) in `testSpawningSailsLiftChildProcessInCwd()`. I may just be a test helper, but I\'m serious about assertions!!!');
  }

  describe('and then waiting for a bit', function() {

    // We can't use HTTP or ws:// requests for IPC for these tests, beause we're trying
    // to determine whether the Sails app has _actually loaded_, not just whether HTTP
    // requests will work (although that's good to know too).
    //
    // To work around that, we use a timeout.
    // N_SECONDS is used below to determine how long to wait for the lift before
    // attempting to shut her down with a SIGTERM. We _could_ wait for output, but that's
    // pretty vague (since it could be anything). At least with the timeout, we know that
    // if Sails is still lifting, the test will fail.
    //
    // In the future, we could use some other sort of IPC strategy to pull this off,
    // but that would involve changes to the actual Sails core code base, which seems
    // silly and potentially costly as far as time and technical debt in the code base.
    // Anyway, it's unnecessary since this works so... daintily.
    var N_SECONDS = 4;

    // The max # of seconds to wait for graceful shutdown is used below.
    // It's the other piece of how we know the app must have successfully lifted vs not.
    // In addition to the N_SECONDS, this extra time gets tacked on at the very end below.
    var MAX_SECONDS_TO_WAIT_FOR_GRACEFUL_SHUTDOWN = 1;

    // Tell mocha not to look red and angry, since we totally planned for it to take this long.
    this.slow((N_SECONDS*1000)+(MAX_SECONDS_TO_WAIT_FOR_GRACEFUL_SHUTDOWN*1000)+1500);


    // This variable will hold the reference to the child process.
    var sailsLiftProc;

    // Spawn the child process
    before(function(done) {
      sailsLiftProc = MProcess.spawnChildProcess({
        command: 'node',
        cliArgs: [opts.pathToSailsCLI, 'lift'].concat(opts.liftCliArgs)
      }).execSync();

      // // For debugging, as needed:
      // sailsLiftProc.stdout.on('data', function (data){
      //   console.log('stdout:',''+data);
      // });
      // sailsLiftProc.stderr.on('data', function (data){
      //   console.log('stderr:',''+data);
      // });

      // After N seconds, continue to the test.
      setTimeout(function (){
        return done();
      }, N_SECONDS*1000);
    });//</before>


    it('should still be lifted', function(done) {
      // Technically, we don't really know if the server is still lifted in here.
      // But we will find out in a bit (in the `after`).  So we'll do another little
      // timeout, this time just somewhere between 0 and 500ms.  Why not have a little
      // fun right?  Throwing a little entropy into the mix. Bam!
      setTimeout(function (){
        return done();
      }, Math.floor(Math.random()*500));
    });//</it>



    // Now if httpRequestInstructions were provided, we ping to the server to see whether this puppy
    // is ready to handle all those hot hot HTTP requests we have planned for it.
    // (expectations of response vary based on options passed to this helper)
    if (!isUndefined(opts.httpRequestInstructions)){
      // If the `opts.expectFailedLift` flag was provided, we're actually expecting an error here.
      if (opts.expectFailedLift) {
        it('should FAIL when a `'+opts.httpRequestInstructions.method+'` request is sent to `'+opts.httpRequestInstructions.uri+', because we\'re expecting Sails to have failed when attempting to lift`', function(done) {
          request(opts.httpRequestInstructions, function(err, response, body) {
            if (err) {
              // Since the `opts.expectFailedLift` flag was provided, we're actually expecting an error here.
              return done();
            }
            return done(new Error('Expected request to fail, since Sails should not have lifted successfully'));
          });
        });//</it>
      }
      // Normal case (expecting sails to have lifted)
      else {
        it('should respond with a 200 status code when a `'+opts.httpRequestInstructions.method+'` request is sent to `'+opts.httpRequestInstructions.uri+'`', function(done) {
          request(opts.httpRequestInstructions, function(err, response, body) {
            if (err) {
              // This kind of "omg server is not online" error is generally rather bad.
              return done(err);
            }
            if (response.statusCode !== (opts.httpRequestInstructions.expectedStatusCode||200)) {
              return done(new Error('Expected to get a '+(opts.httpRequestInstructions.expectedStatusCode||200)+' status code from the server, but instead all we got was this lousy status code: `' + response.statusCode + '`'));
            }
            return done();
          });
        });//</it>
      }
    }//</httpRequestInstructions were provided>


    // Now run any additional tests.
    // (i.e. this function contains `it` blocks)
    if (isFunction(opts.fnWithAdditionalTests)) {
      opts.fnWithAdditionalTests();
    }


    // Now send a SIGTERM signal.
    after(function (done){
      MProcess.killChildProcess({
        childProcess: sailsLiftProc,
        maxMsToWait: MAX_SECONDS_TO_WAIT_FOR_GRACEFUL_SHUTDOWN*1000
      }).exec(function (err){
        // If it worked, that means our child process was
        // still alive N seconds after it began lifting, and
        // that it was able to shut down gracefully in a
        // reasonable amount of time (see `maxMsToWait` above).
        if (!err) {
          // The one exception is if the `opts.expectFailedLift` flag was provided, in which case this
          // is actually bad: In that case, it means the server clearly must have been lifted (since we
          // just finished SIGTERMing it to death)
          if (opts.expectFailedLift) {
            return done(new Error('Hmm... But the Sails app should not have been lifted (the graceful shutdown should have failed).'));
          }
          // But otherwise in the general case, this means we're good.
          return done();
        }

        // Otherwise it didn't work, which means our child process never lifted
        // properly, or it was still lifting after N seconds.
        //
        // It also means we need to force-kill the child process or risk
        // loosing little Grunt daemons to run amock in our machines.
        MProcess.killChildProcess({
          childProcess: sailsLiftProc,
          force: true
        }).exec(function (_forceKillErr){
          // Now, if the `opts.expectFailedLift` flag was provided, this is actually what we want.
          if (opts.expectFailedLift) {
            return done();
          }

          // But normally it's totally bad news that we're having to SIGKILL this thing,
          // so we send back an error whether or not the SIGKILL worked.
          if (_forceKillErr) {
            return done(new Error('So there was a problem:\n'+err.stack+'\nBut hey, also force-killing the child process didn\'t work.  So something weird is going on, I\'d say.  Check out the deets on that force kill error:\n' + _forceKillErr.stack));
          }
          else {
            return done(new Error('Should have been able to gracefully shut down child process, because it should have been lifted. Heres the error that came back when attempting the graceful shutdown (although honestly it prbly doesn\'t matter-- it\'s more likely the app just didn\'t successfully lift).  Graceful shutdown error:\n'+err.stack));
          }
        });
      });
    });//</after>
  });//</describe>
};

