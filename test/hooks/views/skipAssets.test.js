/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var request = require('request');
var MProcess = require('machinepack-process');
var MFilesystem = require('machinepack-fs');
var testSpawningSailsLiftChildProcessInCwd = require('../../helpers/test-spawning-sails-lift-child-process-in-cwd');


// // Test `sails lift` in the CWD.
// describe('running `sails lift`', function (){
//   testSpawningSailsLiftChildProcessInCwd({
//     pathToSailsCLI: pathToSailsCLI,
//     liftCliArgs: [],
//     httpRequestInstructions: {
//       method: 'GET',
//       uri: 'http://localhost:1337',
//     }
//   });
// });


// // Test `sails lift --port=1492` in the CWD.
// describe('running `sails lift --port=1492`', function (){
//   testSpawningSailsLiftChildProcessInCwd({
//     pathToSailsCLI: pathToSailsCLI,
//     liftCliArgs: [
//       '--port=1492'
//     ],
//     httpRequestInstructions: {
//       method: 'GET',
//       uri: 'http://localhost:1492',
//     },
//     fnWithAdditionalTests: function (){
//       it('should NOT be able to contact localhost:1337 anymore', function (done){
//         request({
//           method: 'GET',
//           uri: 'http://localhost:1337',
//         }, function(err, response, body) {
//           if (err) { return done(); }
//           return done(new Error('Should not be able to communicate with locahost:1337 anymore.... Here is the response we received:'+util.inspect(response,{depth:null})+'\n\n* * Troublehooting * *\n Perhaps the Sails app running in the child process was not properly cleaned up when it received SIGTERM?  Or could be a problem with the tests.  Find out all this and more after you fix it.'));
//         });
//       });
//     }
//   });
// });
