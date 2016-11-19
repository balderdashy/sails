#!/usr/bin/env node


/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var util = require('util');
var path = require('path');
var rconf = require('../lib/app/configuration/rc');

/**
 * `sails deploy`
 *
 * Deploy the Sails app in the current directory to a hosting provider.
 *
 * @stability 1
 */

module.exports = function() {

  var commands = rconf.commands;
  var deploy = commands && commands.deploy;
  var modulePath = deploy && deploy.module;
  var module;

  // If no module path was specified, bail out
  if (!modulePath) {
    console.error('No module specified for the `deploy` command.');
    console.error('To use `sails deploy`, set a `commands.deploy.module` setting in your .sailsrc file');
    return;
  }

  // Attempt to require the specified module from the project node_modules folder
  try {
    module = require(path.resolve(process.cwd(), 'node_modules', modulePath));
  }

  // If the module couldn't be required, bail out
  catch (e) {
    console.error('Could not require module at path: ' + modulePath + '.  Please check the path and try again.');
  }

  try {
    // Attempt to run the deploy command
    module({config: rconf}, function(err, result) {
      // If there were any issues, log them to the console.
      if (err) {
        console.error('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        console.error('Deployment failed!  Details below:');
        console.error('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        console.error(err);
      }
    });
  }
  // Chances are we won't catch any errors internal to the deploy command here;
  // this would probably be an error at the top level of the deploy script.
  catch(e) {
    console.error('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.error('Could not run deploy!  Details below:');
    console.error('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.error(e);
  }


};
