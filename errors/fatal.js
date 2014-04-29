/**
 * Module dependencies
 */
var nodeutil = require('util');
var nodepath = require('path');

// Build logger using best-available information
// when this module is initially required.
var log = require('captains-log')(require('../lib/app/configuration/rc'));

/**
 * Fatal Errors
 */
module.exports = {

  // Lift-time and load-time errors
  failedToLoadSails: function(err) {
    log.error(err);
    log.error('Could not load Sails.');
    log.error('Are you using the latest stable version?');
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

  badLocalDependency: function(pathTo_localSails, requiredVersion) {
    log.error(
      'The local Sails dependency installed at `' + pathTo.localSails + '` ' +
      'has a corrupted, missing, or un-parsable package.json file.'
    );
    log.error('You may consider running:');
    log.error('rm -rf ' + pathTo_localSails + ' && npm install sails@' + app.dependencies.sails);
    _terminateProcess(1);
  },

  // TODO: replace the inline version of this error
  // app/loadHooks.js:42
  malformedHook: function() {
    log.error('Malformed hook! (' + id + ')');
    log.error('Hooks should be a function with one argument (`sails`)');
    _terminateProcess(1);
  },

  // TODO: replace the inline version of this error
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



  // This doesn't technically _need_ to be a fatal error- it just is
  // because certain grunt modules (e.g. grunt-contrib-watch) don't restart
  // when an error occurs.
  __GruntAborted__: function(consoleMsg, stackTrace) {

    var gruntErr =
      '\n------------------------------------------------------------------------\n' +
      consoleMsg + '\n' + (stackTrace || '') +
      '\n------------------------------------------------------------------------';
    log.error(gruntErr);
    log.blank();

    log.error('Looks like a Grunt error occurred--');
    log.error('Please fix it, then **restart Sails** to continue running tasks (e.g. watching for changes in assets)');
    log.error('Or if you\'re stuck, check out the troubleshooting tips below.');
    log.blank();

    log.error('Troubleshooting tips:'.underline);
    var relativePublicPath = (nodepath.resolve(process.cwd(), './.tmp'));
    var uid = process.getuid && process.getuid() || 'YOUR_COMPUTER_USER_NAME';
    log.error();
    log.error(' *-> Are "grunt" and related grunt task modules installed locally?  Run `npm install` if you\'re not sure.');
    log.error();
    log.error(' *-> You might have a malformed LESS, SASS, CoffeeScript file, etc.');
    log.error();
    log.error(' *-> Or maybe you don\'t have permissions to access the `.tmp` directory?');
    log.error('     e.g., `' + relativePublicPath + '`', '?');
    log.error();
    log.error('     If you think this might be the case, try running:');
    log.error('     sudo chown -R', uid, relativePublicPath);
    log.blank();

    // See note above this function - for now, this will not
    // actually terminate the process.  The rest of Sails should
    // continue to run.
    // return _terminateProcess(1);
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
    // 	probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
    // }
    // log.error('Otherwise, if you\'re trying to use an adapter named `' + connectionId + '`, please run ' +
    // 	'`npm install ' + probableAdapterModuleName + '@' + sails.majorVersion + '.' + sails.minorVersion + '.x`');
    return _terminateProcess(1);
  },


  __ModelIsMissingConnection__: function(sourceModelId) {
    log.error(nodeutil.format('One of your models (%s) doesn\'t have a connection.', sourceModelId));
    log.error('Do you have a default `connection` in your `config/models.js` file?');
    return _terminateProcess(1);
  },

  __UnknownAdapter__: function(adapterId, sourceModelId, sailsMajorV, sailsMinorV) {
    log.error('Trying to use unknown adapter, "' + adapterId + '", in model `' + sourceModelId + '`.');
    log.error('Are you sure that adapter is installed in this Sails app?');
    log.error('If you wrote a custom adapter with identity="' + adapterId + '", it should be in this app\'s adapters directory.');

    var probableAdapterModuleName = adapterId.toLowerCase();
    if (!probableAdapterModuleName.match(/^(sails-|waterline-)/)) {
      probableAdapterModuleName = 'sails-' + probableAdapterModuleName;
    }
    log.error('Otherwise, if you\'re trying to use an adapter named `' + adapterId + '`, please run ' +
      '`npm install ' + probableAdapterModuleName + '@' + sailsMajorV + '.' + sailsMinorV + '.x`');
    return _terminateProcess(1);
  },

  __InvalidAdapter__: function(attemptedModuleName, supplementalErrMsg) {
    log.error('There was an error attempting to require("' + attemptedModuleName + '")');
    log.error('Is this a valid Sails/Waterline adapter?  The following error was encountered ::');
    log.error(supplementalErrMsg);

    return _terminateProcess(1);
  }
};



/**
 *
 * TODO: Make all of this more elegant.
 * ========================================================
 * + Ideally we don't call `process.exit()` at all.
 * We should consistently use `sails.lower()` for unhandleable core
 * errors and just trigger the appropriate callback w/ an error for
 * core lift/load and any CLI errors.
 *
 * + Then we won't have to worry as much about dangling child processes
 * and things like that. Plus it's more testable that way.
 *
 * In practice, the best way to do this may be an error domain or an
 * event emitted on the sails object (or both!)
 * ========================================================
 *
 *
 *
 * TODO: Merge w/ app/teardown.js
 * ========================================================
 * (probably achievable by doing the aforementioned cleanup)
 * ========================================================
 */



/**
 * _terminateProcess
 *
 * Terminate the process as elegantly as possible.
 * If process.env is 'test', throw instead.
 *
 * @param  {[type]} code [console error code]
 * @param  {[type]} opts [currently unused]
 */
function _terminateProcess(code, opts) {
  if (process.env.NODE_ENV === 'test') {
    var Signal = new Error({
      type: 'terminate',
      code: code,
      options: {
        todo: 'put the stuff from the original errors in here'
      }
    });
    throw Signal;
  }

  return process.exit(code);
}
