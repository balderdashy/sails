/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var request = require('request');
var MProcess = require('machinepack-process');
var MFilesystem = require('machinepack-fs');


describe('Starting sails server with `sails lift`', function() {

  var originalCwd = process.cwd();
  var pathToSailsCLI = path.resolve(__dirname, '../../bin/sails.js');
  var pathToTestApp = path.resolve('testApp');



  describe('in the directory of a newly-generated sails app', function() {

    // Ensure test app does not already exist.
    before(function (done) {
      MFilesystem.rmrf({path: pathToTestApp}).exec(done);
    });

    // Create a Sails app on disk.
    before(function (done){
      MProcess.executeCommand({
        command: util.format('node %s new %s', pathToSailsCLI, pathToTestApp),
      }).exec(done);
    });

    // And CD in.
    before(function (){
      process.chdir(pathToTestApp);
    });

    // Test `sails lift` in the CWD.
    testSpawningSailsLiftChildProcessInCwd({
      pathToSailsCLI: pathToSailsCLI,
      liftCliArgs: []
    });

    // Test `sails lift --port=1492` in the CWD.
    testSpawningSailsLiftChildProcessInCwd({
      pathToSailsCLI: pathToSailsCLI,
      liftCliArgs: [
        '--port=1492'
      ]
    });


    // Finally clean up the Sails app we created earlier.
    after(function (done) {
      MFilesystem.rmrf({path: pathToTestApp}).exec(done);
    });
    // And CD back to where we were before.
    after(function () {
      process.chdir(originalCwd);
    });

  });//</in the directory of a newly-generated sails app>






  describe('in an empty directory', function() {

    var pathToEmptyDirectory = path.resolve('.tmp/an-empty-directory');

    // Ensure empty directory does not already exist.
    before(function (done) {
      MFilesystem.rmrf({path: pathToEmptyDirectory}).exec(done);
    });

    // Then make a new empty folder.
    before(function(done) {
      MFilesystem.mkdir({destination: pathToEmptyDirectory}).exec(done);
    });

    // And CD in.
    before(function (){
      process.chdir(pathToEmptyDirectory);
    });

    // Inject describe block that tests lifing Sails in the CWD
    // by using our concisely-named helper: "testSpawningSailsLiftChildProcessInCwd()".
    testSpawningSailsLiftChildProcessInCwd({
      pathToSailsCLI: pathToSailsCLI
    });

    // Finally clean up the empty directory we've been using.
    after(function (done) {
      MFilesystem.rmrf({path: pathToEmptyDirectory}).exec(done);
    });
    // And CD back to whererever we were before.
    after(function () {
      process.chdir(originalCwd);
    });

  });//</in an empty directory>


});








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
 *           (e.g. `['--prod', '--port=\'your butt\'']`)
 */
function testSpawningSailsLiftChildProcessInCwd (opts){

  if (!util.isArray(opts.liftCliArgs)){
    throw new Error('Consistency violation: Missing or invalid `liftCliArgs` option in `testSpawningSailsLiftChildProcessInCwd()`. I may just be a test helper, but I\'m serious about parameter assertions!!!');
  }
  if (!util.isArray(opts.pathToSailsCLI)){
    throw new Error('Consistency violation: Missing or invalid `pathToSailsCLI` option in `testSpawningSailsLiftChildProcessInCwd()`. I may just be a test helper, but I\'m serious about parameter assertions!!!');
  }

  describe('running `sails lift` and then waiting for a bit', function() {

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


    // Tell mocha not to look red and angry, since we totally planned for it to take this long.
    this.slow((N_SECONDS*1000)+1500);


    // This variable will hold the reference to the child process.
    var sailsLiftProc;

    // Spawn the child process
    before(function(done) {
      sailsLiftProc = MProcess.spawnChildProcess({
        command: 'node',
        cliArgs: [opts.pathToSailsCLI, 'lift'].concat(opts.liftCliArgs)
      }).execSync();

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


    // Now we check to see whether this thing is ready to handle those hot hot HTTP requests.
    it('should respond with a 200 status code when a request is sent to `GET /` at the default port (1337)', function(done) {
      request({
        method: 'GET',
        uri: 'http://localhost:1337',
      }, function(err, response, body) {
        if (err) { return done(err); }
        if (response.statusCode !== 200) {
          return done(new Error('Expected to get a 200 status code from the server, but instead all we got was this lousy status code: `' + response.statusCode + '`'));
        }
        return done();
      });
    });//</it>


    // Now send a SIGTERM signal.
    after(function (done){
      MProcess.killChildProcess({
        childProcess: sailsLiftProc,
        maxMsToWait: 750
      }).exec(function (err){
        // If it worked, that means our child process was
        // still alive N seconds after it began lifting, and
        // that it was able to shut down gracefully in a
        // reasonable amount of time (see `maxMsToWait` above).
        if (!err) { return done(); }

        // Otherwise it didn't work, which means our child process never lifted
        // properly, or it was still lifting after N seconds.
        //
        // It also means we need to force-kill the child process or risk
        // loosing little Grunt daemons to run amock in our machines.
        MProcess.killChildProcess({
          childProcess: sailsLiftProc,
          force: true
        }).exec(function (_forceKillErr){
          if (_forceKillErr) {
            return done(new Error('So there was a problem:\n'+err.stack+'\nBut hey, also force-killing the child process didn\'t work.  So something weird is going on, I\'d say.  Check out the deets on that force kill error:\n' + _forceKillErr.stack));
          }
          return done(err);
        });
      });
    });//</after>
  });//</describe>
}
