/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var request = require('request');
var MProcess = require('machinepack-process');
var MFilesystem = require('machinepack-fs');
var testSpawningSailsLiftChildProcessInCwd = require('../../helpers/test-spawning-sails-lift-child-process-in-cwd');




describe('skipAssets', function() {

  describe('Generate and lift a sails app which has a wildcard route using skipAssets', function() {

    // Track the location of the Sails CLI, as well as the current working directory
    // before we stop hopping about all over the place.
    var originalCwd = process.cwd();
    var pathToSailsCLI = path.resolve(__dirname, '../../../bin/sails.js');

    // Track the location of the test app.
    var pathToTestApp = path.resolve('testApp');

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

    // Change its routes file to use `skipAssets`.
    before(function (done){
      MFilesystem.write({
        destination: path.join(pathToTestApp, 'config/routes.js'),
        string: 'module.exports.routes = { \'get /*\': { view: \'homepage\', skipAssets: true } };',
        force: true,
      }).exec(done);
    });

    // And CD in.
    before(function (){
      process.chdir(pathToTestApp);
    });

    // Lift the app using `sails lift` in the CWD,
    // ensuring everything works as expected.
    describe('running `sails lift', function (){
      testSpawningSailsLiftChildProcessInCwd({
        pathToSailsCLI: pathToSailsCLI,
        liftCliArgs: [],
        httpRequestInstructions: {
          method: 'GET',
          uri: 'http://localhost:1337',
        },
        fnWithAdditionalTests: function (){
          it('should return a JavaScript file when requesting `http://localhost:1337/js/dependencies/sails.io.js`', function (done){
            request({
              method: 'GET',
              uri: 'http://localhost:1337/js/dependencies/sails.io.js',
            }, function(err, response, body) {
              if (err) { return done(err); }
              // console.log('-----\n',response.headers,'\n----------');
              if (response.headers['content-type'].match(/text\/html/)) {
                return done(new Error('Expected javascript content-type header when requesting an asset. `skipAssets` seems to be failing silently!'));
              }
              return done();
            });
          });
        }
      });
    });

    // Finally clean up the Sails app we created earlier.
    after(function (done) {
      MFilesystem.rmrf({path: pathToTestApp}).exec(done);
    });
    // And CD back to where we were before.
    after(function () {
      process.chdir(originalCwd);
    });


  });//</Generate and lift a sails app which has a wildcard route using skipAssets>
});


