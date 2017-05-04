/**
 * Module dependencies
 */

var path = require('path');
var _ = require('@sailshq/lodash');
var Process = require('machinepack-process');
var chalk = require('chalk');
var flaverr = require('flaverr');


/**
 * `sails run`
 *
 * Run a script for the Sails app in the current working directory.
 *
 * This matches either a JavaScript file in the `scripts/` directory, or one of the command-line scripts
 * declared within the `scripts: {}` dictionary in the package.json file.
 *
 * @see https://sailsjs.com/documentation/reference/command-line-interface/sails-run
 */

module.exports = function(scriptName) {


  // First, we need to determine the appropriate script to run.
  // (either a terminal command or a specially-formatted Node.js/Sails.js module)

  // We begin by figuring out whether this is a command-line script or a MaS definition.
  var commandToRun;


  // Check the package.json file.
  try {
    var pathToLocalPackageJson = path.resolve(process.cwd(), 'package.json');
    var packageJson;
    try {
      packageJson = require(pathToLocalPackageJson);
    } catch (e) {
      switch (e.code) {
        case 'MODULE_NOT_FOUND': throw flaverr('E_NO_PACKAGE_JSON', new Error('No package.json file.  Are you sure you\'re in the root directory of a Node.js/Sails.js app?'));
        default: throw e;
      }
    }

    if (!_.isUndefined(packageJson.scripts) && (!_.isObject(packageJson.scripts) || !_.isArray(packageJson.scripts))) {
      throw flaverr('E_MALFORMED_PACKAGE_JSON', new Error('This package.json file has an invalid `scripts` property -- should be a dictionary (plain JS object).'));
    }

    commandToRun = packageJson.scripts[scriptName];

  } catch (e) {
    switch (e.code) {
      case 'E_NO_PACKAGE_JSON':
      case 'E_MALFORMED_PACKAGE_JSON':
        console.error('--');
        console.error(chalk.red(e.message));
        return process.exit(1);

      default:
        console.error('--');
        console.error(chalk.bold('Oops, something unexpected happened:'));
        console.error(chalk.red(e.stack));
        console.error('--');
        console.error('Please read the error message above and troubleshoot accordingly.');
        console.error('(You can report suspected bugs at '+chalk.underline('http://sailsjs.com/bugs')+'.)');
        return process.exit(1);
    }
  }


  // Now check the `scripts/` directory.
  // TODO

  // Ensure that this script is not defined more than once, and that there
  // are no other scripts with ambiguous filenames.
  // TODO

  // Ensure that this script exists.
  // TODO


  // If this is a Node.js/Sails.js script (machine def), then require the script file
  // to get the module definition, then run it using MaS.
  if (!commandToRun) {
    try {
      var pathToScriptDef = path.resolve(process.cwd(), 'scripts/'+scriptName);
      var scriptDef;
      try {
        scriptDef = require(pathToScriptDef);
      } catch (e) {
        switch (e.code) {
          case 'MODULE_NOT_FOUND': throw flaverr('E_FAILED_TO_REQUIRE_SCRIPT_DEF', new Error('Encountered an error while loading the script definition.  Are you sure this is a well-formed Node.js/Sails.js script definition?  Error details:\n'+e.stack));
          default: throw e;
        }
      }

      // Now actually run the script.
      // TODO

    } catch (e) {
      console.error(e);
      return process.exit(1);
    }
  }
  // Otherwise, this is just a command-line script, so execute the command like you would on the terminal.
  else {
    Process.executeCommand({
      command: commandToRun,
    }).exec(function (err, report) {
      if (err) {
        console.error('Error occured running `'+ commandToRun+ '`');
        console.error('Please resolve any issues and try `sails run '+scriptName+'` again.');
        console.error('Details:');
        console.error(err);
        return process.exit(1);
      }

      console.log();
      console.log('Done.');
      return process.exit(0);
    });//< Process.executeCommand().exec() > _∏_
  }//</ else >

};

