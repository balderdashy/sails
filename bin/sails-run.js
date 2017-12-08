/**
 * Module dependencies
 */

var path = require('path');
var fs = require('fs');
var _ = require('@sailshq/lodash');
var chalk = require('chalk');
var COMMON_JS_FILE_EXTENSIONS = require('common-js-file-extensions');
var flaverr = require('flaverr');
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Note that `whelk`, `machinepack-process`, and `../lib/app` are
// conditionally required below, only in the cases where they are actually used.
// (That way you don't have to wait for them to load if you're not using them.)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


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
    console.error('    sails run rebuild-cloud-sdk');
    console.error();
    console.error('^ runs `scripts/rebuild-cloud-sdk.js`.');
    console.error();
    console.error('(For more help, visit '+chalk.underline('https://sailsjs.com/support')+'.)');
    return process.exit(1);
  }

  // Remove `scripts/` prefix if it exists (allows users to do sails run scripts/foo, so they can use tab autocomplete).
  scriptName = _.trim(scriptName);
  scriptName = scriptName.replace(/^scripts\//, '');

  // Unless the script name is under a "scope" (as in `@sailshq/some-package`), don't allow slashes in the name.
  if (scriptName.match(/\//) && scriptName[0] !== '@') {
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


  // First, we need to determine the appropriate script to run.
  // (either a terminal command or a specially-formatted Node.js/Sails.js module)

  // We begin by figuring out whether this is a script from the package.json
  // or a definition in the `scripts/` folder.
  var pjCommandToRun;

  // Check the package.json file.
  try {
    var pathToLocalPj = path.resolve(process.cwd(), 'package.json');
    var packageJson;
    try {
      packageJson = require(pathToLocalPj);
    } catch (e) {
      switch (e.code) {
        case 'MODULE_NOT_FOUND': throw flaverr('E_NO_PACKAGE_JSON', new Error('No package.json file.  Are you sure you\'re in the root directory of a Node.js/Sails.js app?'));
        default: throw e;
      }
    }

    if (!_.isUndefined(packageJson.scripts) && (!_.isObject(packageJson.scripts) || _.isArray(packageJson.scripts))) {
      throw flaverr('E_MALFORMED_PACKAGE_JSON', new Error('This package.json file has an invalid `scripts` property -- should be a dictionary (plain JS object).'));
    }

    pjCommandToRun = packageJson.scripts[scriptName];

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


  // Now check both the `scripts/` directory and node_modules to see if a matching script exists.
  var relativePathToAppScript = 'scripts/'+scriptName+'.'+fileExtension;
  var relativePathToInstalledScript = (function(){
    // Handle scripts organized under org subdirectories in node_modules.
    var installedScriptName = scriptName;
    var org = '';
    if (scriptName[0] === '@') {
      org = scriptName.split('/')[0] + '/';
      installedScriptName = scriptName.split('/')[1];
    }
    installedScriptName = installedScriptName.replace(/^sails-run-/,'');
    return 'node_modules/' + org + 'sails-run-'+installedScriptName;
  })();

  var installedScriptExists = fs.existsSync(path.resolve(relativePathToInstalledScript));
  var appScriptExists = fs.existsSync(path.resolve(relativePathToAppScript));
  var doesScriptFileExist = appScriptExists || installedScriptExists;

  // Ensure that this script is not defined in BOTH places.
  if (pjCommandToRun && doesScriptFileExist) {
    console.error('Cannot run `'+scriptName+'` because it is too ambiguous.');
    console.error('A script should only be defined once, but that script is defined in both the package.json file');
    console.error('AND as a file in the `scripts/` directory.');
    return process.exit(1);
  }

  // Ensure that this script exists one place or the other.
  if (!pjCommandToRun && !doesScriptFileExist) {
    console.error('Unknown script: `'+scriptName+'`');
    console.error('No matching script is defined at `'+relativePathToAppScript+'`.');
    console.error('(And there is no matching NPM script in the package.json file.)');
    return process.exit(1);
  }


  // If this is a Node.js/Sails.js script (machine def), then require the script file
  // to get the module definition, then run it using MaS.
  if (!pjCommandToRun) {
    try {
      var pathToScriptDef = path.resolve(process.cwd(), appScriptExists ? relativePathToAppScript : relativePathToInstalledScript);
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
        console.error('      fn: async function (inputs, exits) {');
        console.error('        // ...');
        console.error('        sails.log(\'Hello world!\');');
        console.error('        return exits.success();');
        console.error('      }');
        console.error('    };');
        console.error('    ```````````````````````````````````````````````````````````');
        console.error('');
        console.error(' [?] Visit https://sailsjs.com/support for assistance.');
        console.error('');
        return process.exit(1);
      }

      // Modify the script definition to add `sails: require('sails')` and `habitat: 'sails'`
      // (unless it explicitly disables this behavior with `sails: false` or by explicitly
      // declaring some other habitat)
      var isLifecycleMgmtExplicitlyDisabled = (
        scriptDef.sails === false ||
        (scriptDef.habitat !== undefined && scriptDef.habitat !== 'sails')
      );
      if (!isLifecycleMgmtExplicitlyDisabled) {
        // (Only require the rest of the Sails framework if it's needed.)
        var Sails = require('../lib/app');
        scriptDef.habitat = 'sails';
        scriptDef.sails = Sails();
      }

      // (Only require whelk if it's needed.)
      var whelk = require('whelk');

      // console.log('process.argv ->', require('util').inspect(process.argv,{depth:null}));
      // console.log('arguments ->', require('util').inspect(arguments,{depth:null}));
      // console.log('scriptName ->', scriptName);
      // console.log('Array.prototype.slice.call(arguments, 1, -1) ->', Array.prototype.slice.call(arguments, 1, -1));

      // Pass in override for runtime array of serial command-line arguments
      // (we rely on commander having parsed them for us so that we don't include `sails`, `run`, `node`, etc)
      scriptDef.rawSerialCommandLineArgs = Array.prototype.slice.call(arguments, 1, -1);

      // Now actually run the script.
      whelk(scriptDef);

    } catch (err) {
      console.error(err);
      return process.exit(1);
    }
  }
  // Otherwise, this is an NPM script of some kind, from the package.json file.
  else {


    // So execute the command like you would on the terminal.

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Consider pulling this boilerplate setup code into spawnChildProcess() machine
    // as a way of leveraging a subshell to remove the need to pass in CLI args directly.
    // Maybe as an option at least.
    //
    // > Also, we should also consider adding a notifier function to optionally provide
    // > special instructions of what to do when the current (parent) process receives a SIGINT.
    // > (Otherwise, by default, the SIGINT behavior implemented below could be used instead.)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    //
    // -AND/OR-
    //
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Consider exposing an optional `onData` input to the more basic `executeCommand()`
    // machine.  That way, you can just pass in a notifier function that handles the child's
    // writes to its stdout and stderr streams without having to dig into all of these
    // annoying complexities.  Also, it'd then be possible to add another input: a flag that
    // allows you to choose whether or not to store output and pass it to the callback
    // (e.g. `bufferOutput`).
    //
    // > Finally, we should also consider adding the same SIGINT notifier function mentioned above.
    //
    // Here's an example of how we might put it all together:
    // ```
    // Process.executeCommand({
    //   command: pjCommandToRun,
    //   bufferOutput: false,
    //   killOnParentSigint: false,
    //   onData: function (data, stdStreamName){
    //     process[stdStreamName].write(data);
    //   }
    // }).exec(function (err) {
    //   if (err) {
    //     console.error('Error occured running `'+ pjCommandToRun+ '`');
    //     console.error('Please resolve any issues and try `sails run '+scriptName+'` again.');
    //     console.error('Details:');
    //     console.error(err);
    //     return process.exit(1);
    //   }//-•
    //
    //   return process.exit(0);
    // });//< Process.executeCommand().exec() > _∏_
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // (Only require machinepack-process if it's needed.)
    var Process = require('machinepack-process');

    // Determine an appropriate name for our shell.
    // > This is mainly just so we don't have to try and do any fancy parsing of the command,
    // > allowing for more platform-specific customization.  (Mirroring the NPM CLI here)
    var shProcName;
    var shFlag;
    if (process.platform === 'win32') {
      shProcName = process.env.comspec || 'cmd';
      shFlag = '/d /s /c';
    }
    else {
      shProcName = 'sh';
      shFlag = '-c';
    }

    var childProcess = Process.spawnChildProcess({
      command: shProcName,
      cliArgs: [ shFlag, pjCommandToRun ]
    }).execSync();

    // Pipe output from the child process to the current (parent) process.
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);

    // Set up CTRL+C listener on the parent process that will force-kill this child process.
    // (Note that we define the event listener as a named function so we can unbind it below.)
    var onSigTerm = function (){
      Process.killChildProcess({ childProcess: childProcess, force: true }).exec(function (_forceKillErr){
        if (_forceKillErr) {
          console.error('There was a problem terminating this script:\n'+_forceKillErr.stack+'\nHere are some details which might be helpful:\n' + _forceKillErr.stack);
        }
      });
    };
    process.once('SIGTERM', onSigTerm);


    var spinlocked;
    (function (proceed){

      childProcess.on('error', function (err) { return proceed(err); });
      childProcess.stderr.on('error', function (err) { return proceed(err); });
      childProcess.stdout.on('error', function (err) { return proceed(err); });
      childProcess.on('close', function (code, signal) {
        // log.silly('lifecycle', logid(pkg, stage), 'Returned: code:', code, ' signal:', signal)
        // If a signal was received, terminate the current parent process (i.e. `sails run`).
        if (signal) {
          // Note that, in this case, `proceed()` is never called.
          // (But it doesn't actually matter, because we'll have killed the process.)
          return process.kill(process.pid, signal);
        }

        // Otherwise if we got a non-zero exit code, then consider this an error.
        if (code !== 0) {
          return proceed(new Error('Exit status '+code));
        }

        // Otherwise, consider it a success.
        return proceed();
      });

    })(function(err){
      if (err) {

        if (spinlocked) {
          console.error(err);
          return;
        }
        spinlocked = true;

        console.error('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
        console.error('Error occured running `'+ pjCommandToRun+ '`');
        console.error('Please resolve any issues and try `sails run '+scriptName+'` again.');
        console.error('Details:');
        console.error(err);

        process.removeListener('SIGTERM', onSigTerm);
        return process.exit(1);
      }//-•

      return process.exit(0);

    });//_∏_  (†)

  }//</ else >

};

