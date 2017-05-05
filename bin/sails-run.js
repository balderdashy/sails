/**
 * Module dependencies
 */

var path = require('path');
var fs = require('fs');
var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var COMMON_JS_FILE_EXTENSIONS = require('common-js-file-extensions');
var flaverr = require('flaverr');
var Process = require('machinepack-process');
var machineAsScript = require('machine-as-script');
var Sails = require('../lib/app');


/**
 * Module constants
 */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Supported file extensions for imperative code files such as hooks:
//  • 'js' (.js)
//  • 'ts' (.ts)
//  • 'es6' (.es6)
//  • ...etc.
//
// > For full list, see:
// > https://github.com/luislobo/common-js-file-extensions/blob/210fd15d89690c7aaa35dba35478cb91c693dfa8/README.md#code-file-extensions
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var BASIC_SUPPORTED_FILE_EXTENSIONS = COMMON_JS_FILE_EXTENSIONS.code;


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

  // If there is only one argument, it means there is actually no scriptName at all.
  // (A detail of how commander works.)
  if (arguments.length === 1) {
    scriptName = undefined;
  }

  // Sanitize the script name, for comfort.
  if (!scriptName) {
    console.error('Which one?  (To run a script, provide its name.)');
    console.error('For example:');
    console.error('    sails run add-customer');
    console.error();
    console.error('^ runs `scripts/add-customer.js`.');
    console.error();
    console.error('(For more help, visit '+chalk.underline('http://sailsjs.com/support')+'.)');
    return process.exit(1);
  }

  scriptName = _.trim(scriptName);
  scriptName = scriptName.replace(/^scripts\//, '');
  if (scriptName.match(/\//)) {
    console.error('Cannot run `'+scriptName+'`.  Script name should never contain any slashes.');
    return process.exit(1);
  }//-•

  // Examine the script name and determine if it has a file extension included.
  // If so, we'll rip it out of the script name, but keep a reference to it.
  // Otherwise, we'll always assume that we're looking for a normal `.js` file.
  var X_BASIC_SUPPORTED_FILE_EXTENSION = new RegExp('^([^.]+)\\.(' + BASIC_SUPPORTED_FILE_EXTENSIONS.join('|') + ')$');
  var matchedFileExtension = scriptName.match(X_BASIC_SUPPORTED_FILE_EXTENSION);
  var fileExtension;
  if (matchedFileExtension) {
    fileExtension = matchedFileExtension[2];
    scriptName = scriptName.replace(X_BASIC_SUPPORTED_FILE_EXTENSION, '$1');
  }
  else {
    fileExtension = 'js';
  }

  // console.log(scriptName);
  // console.log(fileExtension);
  // return;

  // First, we need to determine the appropriate script to run.
  // (either a terminal command or a specially-formatted Node.js/Sails.js module)

  // We begin by figuring out whether this is a command-line script or a script (MaS) definition.
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

    if (!_.isUndefined(packageJson.scripts) && (!_.isObject(packageJson.scripts) || _.isArray(packageJson.scripts))) {
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


  // Now check the `scripts/` directory to see if the file exists.
  var relativePathToScript = 'scripts/'+scriptName+'.'+fileExtension;
  var doesScriptFileExist = fs.existsSync(path.resolve(relativePathToScript));

  // Ensure that this script is not defined in BOTH places.
  if (commandToRun && doesScriptFileExist) {
    console.error('Cannot run `'+scriptName+'` because it is too ambiguous.');
    console.error('A script should only be defined once, but that script is defined in both the package.json file');
    console.error('AND as a file in the `scripts/` directory.');
    return process.exit(1);
  }

  // Ensure that this script exists one place or the other.
  if (!commandToRun && !doesScriptFileExist) {
    console.error('Unknown script: `'+scriptName+'`');
    console.error('No matching script is defined at `'+relativePathToScript+'`.');
    console.error('(And there is no matching NPM script in the package.json file.)');
    return process.exit(1);
  }


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

      // Make sure the script is at least basically valid.
      // (MaS will check it more later -- this is just preliminary -- and also to make sure that it's not `{}`,
      // the special indicator that the script definition didn't export _ANYTHING_ at all.)
      if (!_.isObject(scriptDef) || _.isArray(scriptDef) || _.isEqual(scriptDef, {})) {
        console.error('');
        console.error('');
        console.error('Invalid script: `'+scriptName+'`');
        console.error('');
        console.error('A well-formed Node.js/Sails.js script should export a script definition.');
        console.error('In other words, it should be defined more or less like this:');
        console.error('');
        console.error('    ```````````````````````````````````````````````````````````');
        console.error('    module.exports = {');
        console.error('      description: \'Do a thing given some stuff.\',');
        console.error('      inputs: {');
        console.error('        someStuff: { type: \'string\', required: true }');
        console.error('      },');
        console.error('      fn: function (inputs, exits) {');
        console.error('        // ...');
        console.error('        sails.log(\'Hello world!\');');
        console.error('        return exits.success();');
        console.error('      }');
        console.error('    };');
        console.error('    ```````````````````````````````````````````````````````````');
        console.error('');
        return process.exit(1);
      }

      // Modify the script definition to add `sails: require('sails')` and `habitat: 'sails'`
      // (unless it explicitly disables this behavior with `sails: false` or by explicitly
      // declaring some other habitat)
      var isLifecycleMgmtExplicitlyDisabled = (
        scriptDef.sails === false || (
          !_.isUndefined(scriptDef.habitat) && scriptDef.habitat !== 'sails'
        )
      );
      if (!isLifecycleMgmtExplicitlyDisabled) {
        scriptDef.habitat = 'sails';
        scriptDef.sails = Sails();
      }

      // Now actually run the script.
      machineAsScript(scriptDef).exec();

    } catch (e) {
      console.error(e);
      return process.exit(1);
    }
  }
  // Otherwise, this is an NPM script of some kind, from the package.json file.
  else {
    // So execute the command like you would on the terminal.
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

      // Log output, if any.
      if (report.stderr) { console.log(report.stderr); }
      if (report.stdout) { console.log(report.stdout); }

      return process.exit(0);
    });//< Process.executeCommand().exec() > _∏_


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Consider allowing streaming output:
    // `````````````````````````````````````````````````````````
    // sailsLiftProc = MProcess.spawnChildProcess({
    //   command: 'node',
    //   cliArgs: opts.cliArgs,
    //   environmentVars: opts.envVars
    // }).execSync();
    //
    // sailsLiftProc.stdout.on('data', function (data){
    //   console.log('stdout:',''+data);
    //   // ...
    // });
    // sailsLiftProc.stderr.on('data', function (data){
    //   console.log('stderr:',''+data);
    //   // ...
    // });
    // `````````````````````````````````````````````````````````
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  }//</ else >

};

