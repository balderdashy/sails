/**
 * Test dependencies
 */

var assert = require('assert');
var fs = require('fs');
var wrench = require('wrench');
var request = require('request');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require('path');

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;





// describe.skip('Starting sails server with lift', function() {

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
//           sailsChildProc.lower(); // << ??? what?
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
//                 sailsChildProc.lower();
//                 done(new Error(err));
//               }

//               assert(response.statusCode === 200);
//               process.chdir('../');
//               sailsChildProc.lower(); // << ??? what?
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





  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  // The following commented-out tests have timing issues and should be
  // re-done. If you are interested in contributing, this would be a great
  // place to jump in!
  //
  // ~mike
  // March, 2016
  // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *


  // describe('with command line arguments', function() {
  //  afterEach(function() {
  //    sailsServer.stderr.removeAllListeners('data');
  //    sailsServer.lower();
  //    process.chdir('../');
  //  });

  //  it('--prod should change the environment to production', function(done) {

  //    // Move into app directory
  //    process.chdir(appName);

  //    // Overrwrite session config file
  //    // to set session adapter:null ( to prevent warning message from appearing on command line )
  //    fs.writeFileSync('config/session.js', 'module.exports.session = { adapter: null }');


  //    sailsServer = spawn(sailsBin, ['lift', '--prod', '--port=1342']);

  //    sailsServer.stderr.on('data', function(data) {
  //      var dataString = data + '';
  //      if (dataString.indexOf('production') !== -1) {
  //        return done();
  //      }
  //        else return done(new Error('Expected log output to contain "production", but it didnt. Instead got: '+dataString));
  //    });
  //  });

  //  it('--dev should change the environment to development', function(done) {

  //    // Move into app directory
  //    process.chdir(appName);

  //    // Change environment to production in config file
  //    fs.writeFileSync('config/application.js', 'module.exports = ' + JSON.stringify({
  //      appName: 'Sails Application',
  //      port: 1342,
  //      environment: 'production',
  //      log: {
  //        level: 'info'
  //      }
  //    }));

  //    sailsServer = spawn(sailsBin, ['lift', '--dev', '--port=1342']);

  //      sailsServer.stderr.on('data', function(data) { console.log('stdout DEBUG:',data+''); });
  //      sailsServer.stdout.on('data', function(data) { console.log('stderr DEBUG:', data+''); });

  //    sailsServer.stderr.on('data', function(data) {
  //      var dataString = data + '';
  //      if (dataString.indexOf('development') !== -1) {
  //        return done();
  //      }
  //        else return done(new Error('Expected log output to have "development" in there, but it didnt. Instead got: '+dataString));
  //    });
  //  });
  // });
// });
