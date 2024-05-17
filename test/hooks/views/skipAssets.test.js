/**
 * Module dependencies
 */

var path = require('path');
var util = require('util');
var _ = require('@sailshq/lodash');
var tmp = require('tmp');
var request = require('@sailshq/request');
var MProcess = require('machinepack-process');
var MFilesystem = require('machinepack-fs');
var testSpawningSailsLiftChildProcessInCwd = require('../../helpers/test-spawning-sails-lift-child-process-in-cwd');
var appHelper = require('../../integration/helpers/appHelper');

tmp.setGracefulCleanup();



describe('skipAssets', function() {

  describe('Generate and lift a sails app which has a wildcard route WITHOUT using skipAssets', function() {

    // Track the location of the Sails CLI, as well as the current working directory
    // before we stop hopping about all over the place.
    var originalCwd = process.cwd();
    var pathToSailsCLI = path.resolve(__dirname, '../../../bin/sails.js');

    var pathToTestApp;

    before(function(done) {
      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);
      pathToTestApp = path.resolve(tmpDir.name, 'testApp');
      // Create a new Sails app.
      MProcess.executeCommand({
        command: util.format('node %s new %s --fast --traditional --without=lodash,async', pathToSailsCLI, 'testApp'),
      }).exec(function(err) {
        if (err) {return done(err);}
        appHelper.linkDeps(pathToTestApp);
        return done();
      });
    });


    // Change its routes file to use `skipAssets`.
    before(function (done){
      MFilesystem.write({
        destination: path.join(pathToTestApp, 'config/routes.js'),
        string: 'module.exports.routes = { \'get /*\': function(req, res) {return res.header(\'content-type\',\'text/plain\').send(\'some text\'); } };',
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
        liftCliArgs: ['--port=1331', '--hooks.grunt=false', '--hooks.pubsub=false', '--traditional'],
        httpRequestInstructions: {
          method: 'GET',
          uri: 'http://localhost:1331',
        },
        fnWithAdditionalTests: function (){
          it('should return a view when requesting `http://localhost:1331/js/dependencies/sails.io.js`', function (done){
            request({
              method: 'GET',
              uri: 'http://localhost:1331/js/dependencies/sails.io.js',
            }, function(err, response, body) {
              if (err) { return done(err); }
              try {
                if (!_.isString(response.headers['content-type'])) {
                  return done(new Error('Expected a response content-type header when requesting an asset. `skipAssets` seems to be failing silently!'));
                }
                if (!response.headers['content-type'].match(/text\/plain/)) {
                  return done(new Error('Expected text response content-type header when requesting an asset (but got `'+response.headers['content-type']+'`). `skipAssets` seems to be failing silently!'));
                }
                if (body !== 'some text') {
                  return done(new Error('Expected text response an asset (but got `'+body+'`). `skipAssets` seems to be failing silently!'));
                }
              }
              catch (e) { return done(e); }
              return done();
            });
          });
        }
      });
    });

    // And CD back to where we were before.
    after(function () {
      process.chdir(originalCwd);
    });


  });

  describe('Generate and lift a sails app which has a wildcard route using skipAssets', function() {

    // Track the location of the Sails CLI, as well as the current working directory
    // before we stop hopping about all over the place.
    var originalCwd = process.cwd();
    var pathToSailsCLI = path.resolve(__dirname, '../../../bin/sails.js');

    var pathToTestApp;

    before(function(done) {
      // Create a temp directory.
      var tmpDir = tmp.dirSync({gracefulCleanup: true, unsafeCleanup: true});
      // Switch to the temp directory.
      process.chdir(tmpDir.name);
      pathToTestApp = path.resolve(tmpDir.name, 'testApp');
      // Create a new Sails app.
      MProcess.executeCommand({
        command: util.format('node %s new %s --fast --traditional --without=lodash,async', pathToSailsCLI, 'testApp'),
      }).exec(function(err) {
        if (err) {return done(err);}
        appHelper.linkDeps(pathToTestApp);
        return done();
      });
    });


    // Change its routes file to use `skipAssets`.
    before(function (done){
      MFilesystem.write({
        destination: path.join(pathToTestApp, 'config/routes.js'),
        string: 'module.exports.routes = { \'get /*\': { view: \'pages/homepage\', skipAssets: true }, \'/js/dependencies/sails.io.js\': function(req,res){ return res.header(\'content-type\', \'application/javascript\').send(\'ok\'); } };',
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
        liftCliArgs: ['--port=1331', '--hooks.grunt=false', '--hooks.pubsub=false'],
        httpRequestInstructions: {
          method: 'GET',
          uri: 'http://localhost:1331',
        },
        fnWithAdditionalTests: function (){
          it('should return a JavaScript file when requesting `http://localhost:1331/js/dependencies/sails.io.js`', function (done){
            request({
              method: 'GET',
              uri: 'http://localhost:1331/js/dependencies/sails.io.js',
            }, function(err, response, body) {
              if (err) { return done(err); }
              try {
                if (!_.isString(response.headers['content-type'])) {
                  return done(new Error('Expected a response content-type header when requesting an asset. `skipAssets` seems to be failing silently!'));
                }
                if (!response.headers['content-type'].match(/application\/javascript/)) {
                  return done(new Error('Expected javascript response content-type header when requesting an asset (but got `'+response.headers['content-type']+'`). `skipAssets` seems to be failing silently!'));
                }
                if (body !== 'ok') {
                  return done(new Error('Expected body of `sails.io.js` file to be returned, but instead got something else. `skipAssets` seems to be failing silently!'));
                }
              }
              catch (e) { return done(e); }
              return done();
            });
          });
        }
      });
    });

    // And CD back to where we were before.
    after(function () {
      process.chdir(originalCwd);
    });


  });//</Generate and lift a sails app which has a wildcard route using skipAssets>
});


