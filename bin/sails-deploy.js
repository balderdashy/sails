#!/usr/bin/env node


/**
 * Module dependencies
 */

var _ = require('lodash');
var util = require('util');
var path = require('path');
var child_process = require('child_process');
var uuid = require('node-uuid');
var request = require('request');
var fs = require('fs');
var Azure = require('machinepack-azure');
var Spinner = require('node-spinner');

/**
 * `sails deploy [site] [username] [password]`
 *
 * Deploy the Sails app in the current directory to a hosting provider.
 */

module.exports = function () {

  // Arguments
  var cliArguments = Array.prototype.slice.call(arguments);
  cliArguments.pop();

  var sitename = (cliArguments.length > 0) ? cliArguments[0] : null,
      username = (cliArguments.length > 1) ? cliArguments[1] : null,
      password = (cliArguments.length > 2) ? cliArguments[2] : null;
  
  if (sitename && username && password) {
    // All three parameters given, assume that website already exists
    
    var jobOptions = {
      deploymentUser: username,
      deploymentPassword: password,
      name: 'sailsdeploy.ps1',
      website: sitename
    }

    // (1) Create ZIP package -----------------------------------------------------------
    zipSailsApp({}, {
      error: function (err) {
        console.error('Creating ZIP package failed: ', err);
      },
      success: function () { 
        console.error('ZIP package created.');
    // (1) Upload File ------------------------------------------------------------------
        Azure.uploadFile({
          deploymentUser: username,
          deploymentPassword: password,
          fileLocation: getPathToDeploymentArchive(),
          remotePath: 'site/temp/deployment.zip',
          website: sitename
        }).exec({
          error: function (err) {
            console.error('Uploading file failed: ', err);
          },
          success: function () {
            console.log('Deployment package uploaded');
    // (2) Upload Webjob ----------------------------------------------------------------  
            Azure.uploadWebjob({
              deploymentUser: username,
              deploymentPassword: password,
              fileLocation: path.resolve(__dirname, './azure/sailsdeploy.ps1'),
              website: sitename
            }).exec({
              error: function (err) {
                console.error('Uploading webjob failed: ', err);
              },
              success: function (result) {
                console.log('Deployment script uploaded');
    // (3) Trigger Webjob ---------------------------------------------------------------
                Azure.triggerWebjob(jobOptions).exec({
                  error: function (err) {
                    console.error('Triggering webjob failed: ', err);
                  },
                  success: function () {
                    console.log('Deployment script started');
    // (4) Get Latest Webjob Log --------------------------------------------------------
                    var scriptDone = false;
                    var spinner = Spinner();

                    setInterval(function(){
                        process.stdout.write('\r \033[36mcomputing\033[m ' + spinner.next());
                    }, 250);

                    var getLog = function () {
                      Azure.logWebjob(jobOptions).exec({
                        error: function (err) {
                          console.error('Getting webjob log failed: ', err);
                        },
                        success: function (scriptOutput) {
                          if (scriptOutput.body && scriptOutput.body.indexOf('All done!') > -1) {
                            console.log('Deployment finished.')
                            console.log('The site should be available at ' + sitename + '.azurewebsites.net.');
                            return spinner.stop();
                          } else {
                            getLog();
                          }
                        }
                      })
                    }
                    
                    getLog();
                  }
                })
              }
            })
          }
        })
      }
    });
  } else if (sitename) {
    // Only sitename given, check if it exists
  } else {
    // Nothing given, let's create something!
  }

  // TODO: check if active
/*  Azure.checkActiveSubscription().exec({
    error: function (err){
      console.error('Error', err);
    },
    success: function (isActive){
      (function (next){
        if (isActive) {
          return next();
        }

        Azure.registerAzureAccount({}, {
          error: function (err) {next(err);},
          success: function (result) {
            next();
          }
        });
      })(function afterwards(err){
        if (err) {
          console.error('eRROR:',err);
          return;
        }

        zipSailsApp({},{
          error: function (err){ console.error('fuck: ',err); },
          success: function (){

            // TODO: pull this out and make it set by the user
            var sitename = require(path.resolve('./package.json')).name,
            uploadOptions = {
              website: sitename,
              path: pathToDeploymentArchive
            },
            webjobOptions = {
              website: sitename,
              name: 'sailsdeploy.ps1'
            }
          }
        });
      });
    }
  });*/


  /* Helper Methods */

  /**
   * ```
   * getDeploymentArchiveStream().pipe(outs);
   * ```
   *
   * @return {Readable} get the read stream pointing at the deployment.zip file.
   */
  function getDeploymentArchiveStream() {
    var fs = require('fs');
    return fs.createReadStream(getPathToDeploymentArchive());
  }

  /**
   * @return {String} the absolute path where the .zip deployment archive should live
   */
  function getPathToDeploymentArchive(options) {
    var path = require('path');

    options = options || {
      appPath: process.cwd()
    };

    // TODO: load app config and use configured tmp directory
    var tmpDir = path.resolve(options.appPath, '.tmp/');
    // TODO: configurable filename for archive, or use uuid
    var archiveFilename = 'deployment.zip';
    var archiveAbsPath = path.resolve(tmpDir, archiveFilename);

    return archiveAbsPath;
  }

  /**
   * WARNING: unfinished
   * @param  {[type]} inputs [description]
   * @param  {[type]} exits  [description]
   * @return {[type]}        [description]
   */
  function zipSailsApp(inputs, exits) {

    var Zip = require('machinepack-zip');
    var path = require('path');

    var appPath = path.resolve(process.cwd(), inputs.dir || './');

    // TODO ensure output folder exists
    // TODO ensure src folders exist??

    // Zip up the specified source files or directories and write a .zip file to disk.
    Zip.zip({
      // TODO: get all the things, not just the conventional things
      sources: [
        path.resolve(appPath, 'README.md'),
        path.resolve(appPath, 'app.js'),
        path.resolve(appPath, '.sailsrc'),
        path.resolve(appPath, 'tasks'),
        path.resolve(appPath, 'Gruntfile.js'),
        path.resolve(appPath, 'package.json'),
        path.resolve(appPath, 'assets'),
        path.resolve(appPath, 'views'),
        path.resolve(appPath, 'config'),
        path.resolve(appPath, 'api')
      ],
      destination: getPathToDeploymentArchive(),
    }).exec({
      // An unexpected error occurred.
      error: exits.error,
      // OK.
      success: function () {
        return exits.success();
      }
    });
  }

  // To test zipping, uncomment:
  // zipSailsApp({},{
  //   error: function (err){ console.error('fuck: ',err); },
  //   success: function (){ console.log('ok!'); }
  // });
};

