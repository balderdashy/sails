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
var log = require('single-line-log').stdout;
var prompt = require('prompt');
var colors = require('colors');

/**
 * `sails deploy [site] [username] [password]`
 *
 * Deploy the Sails app in the current directory to a hosting provider.
 */

module.exports = function () {

  // Arguments
  var cliArguments = Array.prototype.slice.call(arguments);
  cliArguments.pop();

  var sitenameCli = (cliArguments.length > 0) ? cliArguments[0] : require(path.resolve('./package.json')).name,
      usernameCli = (cliArguments.length > 1) ? cliArguments[1] : null,
      passwordCli = (cliArguments.length > 2) ? cliArguments[2] : null;
  
  if (sitenameCli && usernameCli && passwordCli) {
    // All three parameters given, assume that website already exists
    deployToSite(sitenameCli, usernameCli, passwordCli);
  } else if (sitenameCli) {
    // Only sitename given, check if it exists
    createSite(sitenameCli, deployToSite)
  } else {
    // Something went wrong
    return console.error('Deployment failed. Usage: sails deploy [sitename] [username] [password]');
  }

  function createSite(sitename, cb) {
    Azure.checkActiveSubscription().exec({
      error: function (err){
        return console.error('Error checking for active subscription: ', err);
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
            return console.error('Error registering Azure account: ', err);
          }

          var createOptions = sitename ? {name: sitename} : {};

          Azure.existsWebsite(createOptions).exec({
            error: function (err) {
              return console.error('Error creating Website: ', err);
            },
            success: function (result) {
              if (result) {
                console.log('Website already exists in account, moving on...');
              } else {
                console.log('Website does not exists in account, trying to create...');
                Azure.createWebsite(createOptions).exec({
                  error: function (err) {
                    return console.error('Error creating Website: ', err);
                  },
                  success: function () {
                    var credentialsLink = 'https://manage.windowsazure.com/#Workspaces/WebsiteExtension/Website/' + sitename + '/dashboard';
                    credentialsLink = credentialsLink.underline.green;

                    console.log('Website ' + sitename + 'created.');
                    console.log('You need to set deployment credentials. For security reasons, this step is manual.\n Open ' + credentialsLink + ' and click "Set Deployment Credentials".'.red)
                    prompt.start();

                    prompt.get({
                      properties: {
                        username: {
                          description: "What is the deployment username?"
                        },
                        password: {
                          description: "What is the deployment password?"
                        }
                      }
                    }, function (err, userInput) {
                      if (err) {
                        return console.error('Error prompting for deployment credentials: ', err);
                      }

                      usernameCli = userInput.username;
                      passwordCli = userInput.password;

                      return cb();
                    });
                  }
                })
              }
            }
          })
        });
      }
    });
  }

  function deployToSite(sitename, username, password) {
    sitename = sitename || sitenameCli;
    username = username || usernameCli;
    password = password || passwordCli;

    var jobOptions = {
      deploymentUser: username,
      deploymentPassword: password,
      name: 'sailsdeploy.ps1',
      website: sitename
    }

    console.log('Starting Deployment');

    // (1) Create ZIP package -----------------------------------------------------------
    zipSailsApp({}, {
      error: function (err) {
        console.error('Creating ZIP package failed: ', err);
      },
      success: function () { 
        console.error('ZIP package created.');
    // (2) Upload File ------------------------------------------------------------------
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
    // (3) Upload Webjob ----------------------------------------------------------------  
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
    // (4) Trigger Webjob ---------------------------------------------------------------
                Azure.triggerWebjob(jobOptions).exec({
                  error: function (err) {
                    console.error('Triggering webjob failed: ', err);
                  },
                  success: function () {
                    console.log('Deployment script started');
    // (5) Get Latest Webjob Log --------------------------------------------------------
                    var scriptDone = false;
                    var spinner = Spinner();

                    var spinnerInterval = setInterval(function(){
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
                            return clearInterval(spinnerInterval);
                          } else {
                            if (scriptOutput.body) {
                              log(scriptOutput.body);
                              process.stdout.write('\r \033[36mcomputing\033[m ' + spinner.next());
                            }
                            setTimeout(getLog, 400);
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
  }

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
        // Inject Azure Node Config
        path.resolve(__dirname, './azure/iisnode.yml'),
        path.resolve(__dirname, './azure/web.config'),
        // Other Stuff
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

