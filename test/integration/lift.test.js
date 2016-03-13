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


    describe('running `sails lift and waiting for a bit`', function() {

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
          cliArgs: [pathToSailsCLI, 'lift']
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


    // describe('using the `--port` CLI option', function() {

    //   it.skip('should start server without errors', function(done){
    //     return done();
    //   });

    //   it.skip('should respond to a request to `GET /` at the indicated port with a 200 status code', function(done) {
    //     return done();
    //   });

    // });//</using the `--port` CLI option>

    // // Finally clean up the Sails app we created earlier.
    // after(function (done) {
    //   MFilesystem.rmrf({path: pathToTestApp}).exec(done);
    // });
    // // And CD back to where we were before.
    // after(function () {
    //   process.chdir(originalCwd);
    // });

  });//</in the directory of a newly-generated sails app>






  describe('in an empty directory', function() {

  //   before(function() {
  //     // Make empty folder and move into it
  //     fs.mkdirSync('empty');
  //     process.chdir('empty');
  //     sailsBin = path.resolve('..', sailsBin);
  //   });

  //   it('should');

  //   after(function() {
  //     // Delete empty folder and move out of it
  //     process.chdir('../');
  //     fs.rmdirSync('empty');
  //     sailsBin = path.resolve('./bin/sails.js');
  //   });

  });//</in an empty directory>


});











// // TODO: redo all the tests below using machinepack-process


// /**
//  * Test dependencies
//  */

// var assert = require('assert');
// var fs = require('fs');
// var wrench = require('wrench');
// var request = require('request');
// var exec = require('child_process').exec;
// var spawn = require('child_process').spawn;
// var path = require('path');

// // Make existsSync not crash on older versions of Node
// fs.existsSync = fs.existsSync || require('path').existsSync;



// describe.skip('Starting sails server with lift (original)', function() {

//   var sailsBin = path.resolve('./bin/sails.js');
//   var appName = 'testApp';
//   var sailsChildProc;

//   before(function() {
//     if (fs.existsSync(appName)) {
//       wrench.rmdirSyncRecursive(appName);
//     }
//   });

//   describe('in an empty directory', function() {

//     before(function() {
//       // Make empty folder and move into it
//       fs.mkdirSync('empty');
//       process.chdir('empty');
//       sailsBin = path.resolve('..', sailsBin);
//     });

//     after(function() {
//       // Delete empty folder and move out of it
//       process.chdir('../');
//       fs.rmdirSync('empty');
//       sailsBin = path.resolve('./bin/sails.js');
//     });

//   });

//   describe('in an sails app directory', function() {

//     it('should start server without error', function(done) {

//       exec('node ' + sailsBin + ' new ' + appName, function(err) {
//         if (err) { return done(err); }

//         // Move into app directory
//         process.chdir(appName);
//         sailsBin = path.resolve('..', sailsBin);

//         sailsChildProc = spawn('node', [sailsBin, 'lift', '--port=1342']);

//         sailsChildProc.stdout.on('data', function(data) {
//           var dataString = data + '';
//           assert(dataString.indexOf('error') === -1);
//           sailsChildProc.stdout.removeAllListeners('data');
//           // Move out of app directory
//           process.chdir('../');
//           sailsChildProc.kill();
//           return done();
//         });
//       });
//     });

//     it('should respond to a request to port 1342 with a 200 status code', function(done) {
//       process.chdir(appName);
//       sailsChildProc = spawn('node', [sailsBin, 'lift', '--port=1342']);
//       sailsChildProc.stdout.on('data', function(data) {
//         var dataString = data + '';
//         // Server has finished starting up
//         if (dataString.match(/Server lifted/)) {
//           sailsChildProc.stdout.removeAllListeners('data');
//           setTimeout(function() {
//             request('http://localhost:1342/', function(err, response) {
//               if (err) {
//                 sailsChildProc.kill();
//                 done(new Error(err));
//               }

//               assert(response.statusCode === 200);
//               process.chdir('../');
//               sailsChildProc.kill();
//               return done();
//             });
//           }, 1000);
//         }
//       });
//     });
//   });

//   after(function() {
//     if (fs.existsSync(appName)) {
//       wrench.rmdirSyncRecursive(appName);
//     }
//   });





//   // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//   // The following commented-out tests have timing issues and should be
//   // re-done. If you are interested in contributing, this would be a great
//   // place to jump in!
//   //
//   // ~mike
//   // March, 2016
//   // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *


//   // describe('with command line arguments', function() {
//   //  afterEach(function() {
//   //    sailsServer.stderr.removeAllListeners('data');
//   //    sailsServer.kill();
//   //    process.chdir('../');
//   //  });

//   //  it('--prod should change the environment to production', function(done) {

//   //    // Move into app directory
//   //    process.chdir(appName);

//   //    // Overrwrite session config file
//   //    // to set session adapter:null ( to prevent warning message from appearing on command line )
//   //    fs.writeFileSync('config/session.js', 'module.exports.session = { adapter: null }');


//   //    sailsServer = spawn(sailsBin, ['lift', '--prod', '--port=1342']);

//   //    sailsServer.stderr.on('data', function(data) {
//   //      var dataString = data + '';
//   //      if (dataString.indexOf('production') !== -1) {
//   //        return done();
//   //      }
//   //        else return done(new Error('Expected log output to contain "production", but it didnt. Instead got: '+dataString));
//   //    });
//   //  });

//   //  it('--dev should change the environment to development', function(done) {

//   //    // Move into app directory
//   //    process.chdir(appName);

//   //    // Change environment to production in config file
//   //    fs.writeFileSync('config/application.js', 'module.exports = ' + JSON.stringify({
//   //      appName: 'Sails Application',
//   //      port: 1342,
//   //      environment: 'production',
//   //      log: {
//   //        level: 'info'
//   //      }
//   //    }));

//   //    sailsServer = spawn(sailsBin, ['lift', '--dev', '--port=1342']);

//   //      sailsServer.stderr.on('data', function(data) { console.log('stdout DEBUG:',data+''); });
//   //      sailsServer.stdout.on('data', function(data) { console.log('stderr DEBUG:', data+''); });

//   //    sailsServer.stderr.on('data', function(data) {
//   //      var dataString = data + '';
//   //      if (dataString.indexOf('development') !== -1) {
//   //        return done();
//   //      }
//   //        else return done(new Error('Expected log output to have "development" in there, but it didnt. Instead got: '+dataString));
//   //    });
//   //  });
//   // });
// });
