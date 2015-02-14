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

/**
 * `sails deploy`
 *
 * Deploy the Sails app in the current directory to a hosting provider.
 */

/* Helper classes (these should probably get their own module) */

var config = {};
config.auth = function () {
  if (config && config.username && config.password) {
    return {
      'user': config.username,
      'pass': config.password
    }
  } else {
    return null;
  }
}

function checkForError(response) {
  response = (response[0] && response[0].headers) ? response[0] : response;

  if (response.headers && response.headers['content-type'] && response.headers['content-type'] === 'text/html') {
    // 'Azure returned text/html (which it shouldn't), checking for errors
    if (response.body && response.body.indexOf('401 - Unauthorized') > -1) {
      return 'Invalid Credentials: The Azure Website rejected the given username or password.';
    }
  }

  return false;
}

/* Exports */

module.exports = function () {

  /* Helpers */

  var createWebsite = function (options, cb) {
    var defaults, command;

    defaults = {
      name: uuid.v4(),
      location: 'West US',
      hostname: null
    };

    _.defaults(options, defaults);

    command = 'azure site create --location "' + options.location + '" "' + options.name + '"';

    child_process.exec(command, function (err, stdout) {

      if (err) {
        return cb(err);
      }

      return cb(null, stdout);
    });
  };

  /* Helper Methods */

  var setDeploymentCredentials = function (options, cb) {
    var defaults, command, output;

    defaults = {
      username: uuid.v4(),
      password: uuid.v4(),
    };

    _.defaults(options, defaults);

    command = 'azure site deployment user set ' + options.username + ' ' + options.password;

    child_process.exec(command, function (err, stdout) {

      if (err) {
        return cb(err);
      }

      output = {
        stdout: stdout,
        username: username,
        password: password
      }

      // TODO: Store in a more appropriate way
      config.username = username;
      config.password = password;

      return cb(null, output);
    });
  };

  var uploadFile = function (fileStream, options, cb) {
    var targetUrl, auth, errorCheck;

    if (!fileStream || !options.path || !options.website) {
      cb(new Error('Filestream, website or file name not provided!'));
    }

    targetUrl = 'https://' + options.website + '.scm.azurewebsites.net/api/vfs/' + options.path;

    request.del(targetUrl, {
      'auth': config.auth()
    }, function (err) {
      if (err) {
        return cb(err);
      }

      fileStream.pipe(request.put(targetUrl, {
          'auth': config.auth()
        },
        function (err, result) {
          if (err) {
            return cb(err);
          }

          errorCheck = checkForError(result);
          if (errorCheck) {
            return cb(new Error(errorCheck));
          }

          cb(null, result);
        }));
    });
  };

  var uploadWebJob = function (fileStream, options, cb) {
    var targetUrl, auth, errorCheck;

    if (!options || !options.website) {
      return cb(new Error('Upload Webjob: No website given'));
    } else if (!fileStream) {
      return cb(new Error('Upload Webjob: No filestream given!'));
    } else if (!options.name) {
      return cb(new Error('Upload Webjob: No name given!'));
    }

    targetUrl = 'https://' + options.website + '.scm.azurewebsites.net/api/triggeredwebjobs/' + options.name;

    request.del(targetUrl, {
      'auth': config.auth()
    }, function (err, response) {
      if (err) {
        return cb(err);
      }

      fileStream.pipe(request.put(targetUrl, {
          'auth': config.auth(),
          'headers': {
            'Content-Disposition': 'attachment; filename=' + options.name
          }
        },
        function (err, response, body) {
          if (err) {
            return cb(err);
          }

          errorCheck = checkForError(response);
          if (errorCheck) {
            return cb(new Error(errorCheck));
          }

          return cb(null, response);
        }));
    })
  };

  var triggerWebJob = function (name, options, cb) {
    var targetUrl, errorCheck;

    if (!options || !options.website) {
      return cb(new Error('Trigger Webjob: No website given'));
    }

    targetUrl = 'https://' + options.website + '.scm.azurewebsites.net/api/triggeredwebjobs/' + name + '/run',

      request.post(targetUrl, {
          'auth': config.auth()
        },
        function (err, response, body) {
          if (err) {
            return cb(err);
          }

          errorCheck = checkForError(response);
          if (errorCheck) {
            return cb(errorCheck);
          }

          return cb(null, errorCheck);
        }
      );
  };

  var getWebjobInfo = function (name, options, cb) {
    var targetUrl, errorCheck;

    if (!name || !options || !options.website) {
      return cb(new Error('Get Webjob Info: No name or no website given'));
    }

    targetUrl = 'https://' + options.website + '.scm.azurewebsites.net/api/triggeredwebjobs/' + name;

    request.get(targetUrl, {
        'auth': config.auth()
      },
      function (err, response) {
        if (err) {
          return cb(err);
        }

        errorCheck = checkForError(response);
        if (errorCheck) {
          return cb(new Error(errorCheck));
        }

        return cb(null, response);
      }
    );
  };

  var getWebjobLog = function (targetUrl, cb) {
    var errorCheck;

    request.get(targetUrl, {
        'auth': config.auth()
      },
      function (err, response) {
        if (err) {
          return cb(err);
        }

        errorCheck = checkForError(response);
        if (errorCheck) {
          return cb(new Error(errorCheck));
        }

        return cb(response);
      }
    );
  };

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

  /* Test: Flow */

  var sitename = 'sailsdeploytest',
      uploadOptions = {
        website: sitename,
        path: 'site/temp/sailsdeploy.zip'
      },
      webjobOptions = {
        website: sitename,
        name: 'sailsdeploy.ps1'
      };

  // Step 1: Zip local folder

  // Step 2: Create Website
  createWebsite({
    name: sitename
  }, function (err, response) {
    if (err) {
      return console.log(err);
    }

    // Step 3: Set Deployment Credentials
    setDeploymentCredentials({}, function (err, response) {
      if (err) {
        //return console.log(err);
      }

      config.username = 'slackbotbender';
      config.password = 'bender123';

      // Step 4: Upload Zip
      uploadFile(fs.createReadStream('./bin/sails.zip'), uploadOptions, function (err, response) {
        if (err) {
          return console.log(err);
        }

        // Step 5: Backup, unzip, npm install
        uploadWebJob(fs.createReadStream('./bin/azure/sailsdeploy.ps1'), webjobOptions, function (err, response) {
          if (err) {
            return console.log(err);
          }

          triggerWebJob('sailsdeploy.ps1', webjobOptions, function (err, response) {
            if (err) {
              return console.log(err);
            }

            getWebjobInfo('sailsdeploy.ps1', webjobOptions, function (err, response) {
              if (err) {
                return console.log(err);
              }

              var responseBody, updaterScriptLog, updaterScriptRunning;

              if (response && response.statusCode === 200) {
                responseBody = JSON.parse(response.body);
                updaterScriptLog = (responseBody.latest_run && responseBody.latest_run.output_url) ? responseBody.latest_run.output_url : '';
                updaterScriptRunning = (updaterScriptLog) ? true : false;
              } else {
                console.log('No 200');
              }

              getWebjobLog(updaterScriptLog, function (err, response) {
                if (err) {
                  return console.log(err);
                }

                console.log(response);
              })
            });
          });
        });
      })
    })
  });
};