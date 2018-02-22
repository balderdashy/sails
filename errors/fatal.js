/**
 * Module dependencies
 */
var nodeutil = require('util');
var CaptainsLog = require('captains-log');

// Once per process:
// Build logger using best-available information
// when this module is initially required.
var rconf = require('../lib/app/configuration/rc')();
var log = CaptainsLog(rconf.log);


/**
 * Fatal Errors
 */
module.exports = {

  // Lift-time and load-time errors
  failedToLoadSails: function(err) {
    log.error();

    // If the error is something the user can fix (as opposed to an internal Sails error AKA bug),
    // just show the error message, not the whole stack trace into Sails core.
    if (err.name && err.name === 'userError') {
      log.error(err.message);
    }

    else {
      // Dont log stack trace if this is a recognized load/lift-time error
      // (& also comes from a core hook)
      switch (err.code) {
        case 'include-all:COULD_NOT_REQUIRE':
        case 'E_COULD_NOT_LOAD_ADAPTER':
        case 'E_ADAPTER_NOT_INSTALLED':
        case 'E_BIND_ERR':
          log.error(err.message); break;
        default:
          log.error(err);
      }
    }

    console.error();
    log.error('Could not load Sails app.');
    log.error();
    log.error('Tips:');
    log.error(' • First, take a look at the error message above.');
    log.error(' • Make sure you\'ve installed dependencies with `npm install`.');
    log.error(' • Check that this app was built for a compatible version of Sails.');
    log.error(' • Have a question or need help?  (http://sailsjs.com/support)');
    _terminateProcess(1);
  },

  noPackageJSON: function() {
    log.error('Cannot read package.json in the current directory (' + process.cwd() + ')');
    log.error('Are you sure this is a Sails app?');
    _terminateProcess(1);
  },

  notSailsApp: function() {
    log.error('The package.json in the current directory does not list Sails as a dependency...');
    log.error('Are you sure `' + process.cwd() + '` is a Sails app?');
    _terminateProcess(1);
  },

  badLocalDependency: function(pathToLocalSails, requiredVersion) {
    log.error(
      'The local Sails dependency installed at `' + pathToLocalSails + '` ' +
      'has a corrupted, missing, or un-parsable package.json file.'
    );
    log.error('You may consider running:');
    log.error('rm -rf ' + pathToLocalSails + ' && npm install sails@' + requiredVersion);
    _terminateProcess(1);
  },

  // FUTURE: inline this error
  // app/loadHooks.js:42
  malformedHook: function() {
    log.error('Malformed hook!');
    log.error('Hooks should be a function with one argument (`sails`)');
    _terminateProcess(1);
  },

  // FUTURE: inline this error
  // app/load.js:146
  hooksTookTooLong: function() {
    var hooksTookTooLongErr = 'Hooks are taking way too long to get ready...  ' +
      'Something might be amiss.\nAre you using any custom hooks?\nIf so, make sure the hook\'s ' +
      '`initialize()` method is triggering its callback.';
    log.error(hooksTookTooLongErr);
    process.exit(1);
  },



  // Invalid user module errors
  invalidCustomResponse: function(responseIdentity) {
    log.error('Cannot define custom response `' + responseIdentity + '`.');
    log.error('`res.' + responseIdentity + '` has special meaning in Connect/Express/Sails.');
    log.error('Please remove the `' + responseIdentity + '` file from the `responses` directory.');
    _terminateProcess(1);
  },


  __UnknownPolicy__: function(policy, source, pathToPolicies) {
    source = source || 'config.policies';

    log.error('Unknown policy, "' + policy + '", referenced in `' + source + '`.');
    log.error('Are you sure that policy exists?');
    log.error('It would be located at: `' + pathToPolicies + '/' + policy + '.js`');
    return _terminateProcess(1);
  },

  __InvalidConnection__: function(connection, sourceModelId) {
    log.error('In model (' + sourceModelId + '), invalid connection ::', connection);
    log.error('Must contain an `adapter` key referencing the adapter to use.');
    return _terminateProcess(1);
  },

  __UnknownConnection__: function(connectionId, sourceModelId) {
    log.error('Unknown connection, "' + connectionId + '", referenced in model `' + sourceModelId + '`.');
    log.error('Are you sure that connection exists?  It should be defined in `sails.config.connections`.');

    // var probableAdapterModuleName = connectionId.toLowerCase();
    // if ( ! probableAdapterModuleName.match(/^(sails-|waterline-)/) ) {
    //   probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
    // }
    // log.error('Otherwise, if you\'re trying to use an adapter named `' + connectionId + '`, please run ' +
    //   '`npm install ' + probableAdapterModuleName + '@' + sails.majorVersion + '.' + sails.minorVersion + '.x`');
    return _terminateProcess(1);
  },


  __ModelIsMissingConnection__: function(sourceModelId) {
    log.error(nodeutil.format('One of your models (%s) doesn\'t have a connection.', sourceModelId));
    log.error('Do you have a default `connection` in your `config/models.js` file?');
    return _terminateProcess(1);
  },

  __UnknownAdapter__: function(adapterId, sourceModelId /*, sailsMajorV, sailsMinorV */) {
    log.error('Trying to use unknown adapter, "' + adapterId + '", in model `' + sourceModelId + '`.');
    log.error('Are you sure that adapter is installed in this Sails app?');
    log.error('If you wrote a custom adapter with identity="' + adapterId + '", it should be in this app\'s adapters directory.');

    var probableAdapterModuleName = adapterId.toLowerCase();
    if (!probableAdapterModuleName.match(/^(sails-|waterline-)/)) {
      probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
    }
    log.error('Otherwise, if you\'re trying to use an adapter named `' + adapterId + '`, please run ' +
      '`npm install ' + probableAdapterModuleName + ' --save'/*'@' + sailsMajorV + '.' + sailsMinorV + '.x`'*/);
    return _terminateProcess(1);
  },

  __InvalidAdapter__: function(attemptedModuleName, supplementalErrMsg) {
    log.error('There was an error attempting to require("' + attemptedModuleName + '")');
    log.error('Is this a valid Sails/Waterline adapter?  The following error was encountered ::');
    log.error(supplementalErrMsg);

    return _terminateProcess(1);
  }
};



// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// FUTURE: Make all of this more elegant (see the info in errors/README)
// (involves getting rid of this file)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -



/**
 * _terminateProcess
 *
 * Terminate the process as elegantly as possible.
 * If process.env is 'test', throw instead.
 *
 * @param  {[type]} code [console error code]
 * @param  {[type]} opts [currently unused]
 */
function _terminateProcess(code /*, opts */) {

  // FUTURE: get rid of this (actual handling will be inline where the fatal errors are
  // actually coming from, so we'll be able to handle it there by actually throwing.
  // That way, it's up to the caller whether it wants to catch the original error and
  // do a deliberate process.exit and omit the error stack (which can be disorienting
  // for folks new to SSJ/Node.js))
  //
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // TODO: Double-check on this, and then remove it if possible:
  // (I'm pretty sure we can get rid of this now b/c all tests have been updated.
  // We should definitely never be checking that NODE_ENV is or isn't anything other
  // than "production")
  if (process.env.NODE_ENV === 'test') {
    throw new Error({
      type: 'terminate',
      code: code,
      // options: {
      //   todo: 'put the stuff from the original errors in here'
      // }
      // ^^ Removed this in Sails v1 since it was useless anyways. ~Mike Dec 11, 2016
    });
  }//-•
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  return process.exit(code);
}
