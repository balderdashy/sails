/**
 * Module dependencies.
 */

var path = require('path');
var _ = require('@sailshq/lodash');
var includeAll = require('include-all');
var flaverr = require('flaverr');
var helpRegisterAction = require('./help-register-action');


/**
 * loadActionModules()
 *
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
module.exports = function loadActionModules (sails, cb) {

  sails.config.paths = sails.config.paths || {};
  sails.config.paths.controllers = sails.config.paths.controllers || 'api/controllers';

  // Keep track of actions loaded from disk, so we can detect conflicts.
  var actionsLoadedFromDisk = {};

  // Load all files under the controllers folder.
  includeAll.optional({
    dirname: sails.config.paths.controllers,
    filter: /(^[^.]+\.(?:(?!md|txt).)+$)/,
    flatten: true,
    keepDirectoryPath: true
  }, function(err, files) {
    if (err) { return cb(err); }

    try {

      // Set up a var to hold a list of invalid files.
      var garbage = [];
      // Traditional controllers are PascalCased and end with the word "Controller".
      var traditionalRegex = new RegExp('^((?:(?:.*)/)*([0-9A-Z][0-9a-zA-Z_]*))Controller\\..+$');
      // Actions are kebab-cased.
      var actionRegex = new RegExp('^((?:(?:.*)/)*([a-z][a-z0-9-]*))\\..+$');


      // Loop through all of the files returned from include-all.
      _.each(files, function(moduleDef) {

        // Get the original filepath of the action or controller.
        var filePath = moduleDef.globalId;

        // If the filepath starts with a dot, ignore it.
        if (filePath[0] === '.') {return;}

        // If the file is in a subdirectory, transform any dots in the subdirectory
        // path into slashes.
        if (path.dirname(filePath) !== '.') {
          filePath = path.dirname(filePath).replace(/\./g, '/') + '/' + path.basename(filePath);
        }

        // Declare a var to hold the eventual action identity.
        var identity = '';

        // Attempt to match the file path to the pattern of a traditional controller file.
        var match = traditionalRegex.exec(filePath);

        // Is it a traditional controller?
        if (match) {

          // If it looks like a traditional controller, but it's not a dictionary,
          // throw it in the can.
          if (!_.isObject(moduleDef) || _.isArray(moduleDef) || _.isFunction(moduleDef)) {
            return garbage.push(filePath);
          }

          // Get the controller identity (e.g. /somefolder/somecontroller)
          identity = match[1];

          // Loop through each action in the controller file's dictionary.
          _.each(moduleDef, function(action, actionName) {

            // Ignore strings (this could be the "identity" property of a module).
            if (_.isString(action)) {return;}

            // Give the action name `_config` special treatement: just merge it into the blueprint
            // config instead of trying to load it as an action.
            if (actionName === '_config') {
              if (sails.config.blueprints) {
                sails.config.blueprints._controllers[identity.toLowerCase()] = action;
              }
              return;
            }

            // The action identity is the controller identity + the action name,
            // with path separators transformed to dots.
            // e.g. somefolder.somecontroller.dostuff
            var actionIdentity = (identity + '/' + actionName).toLowerCase();

            // If the action identity matches one we've already loaded from disk, bail.
            if (actionsLoadedFromDisk[actionIdentity]) {
              throw flaverr({ name: 'userError', code: 'E_CONFLICT', identity: actionIdentity}, new Error('The action `' + actionName + '` in `' + filePath + '` conflicts with a previously-loaded action.'));
            }

            // Attempt to load the action into our set of actions.
            // Since the following code might throw E_CONFLICT errors, we'll inject a `try` block here
            // to intercept them and wrap the Error.
            try {
              helpRegisterAction(sails, action, actionIdentity, true);
            } catch (e) {
              switch (e.code) {

                case 'E_CONFLICT':
                  // Improve error message with addtl contextual information about where this action came from.
                  // (plus a slightly better stack trace)
                  throw flaverr({
                    name: 'userError', code: 'E_CONFLICT', identity: actionIdentity },
                    new Error('Failed to register `' + actionName + '`, an action in the controller loaded from `'+filePath+'` because it conflicts with a previously-registered action.')
                  );

                default:
                  throw e;
              }
            }//</catch>

            // Flag that an action with the given identity was successfully loaded from disk.
            actionsLoadedFromDisk[actionIdentity] = true;

          });
        } // </ is it a traditional controller? >

        // Okay, it's not a traditional controller.  Is it an action?
        // Attempt to match the file path to the pattern of an action file,
        // and make sure it is either a function OR a dictionary containing
        // a function as its `fn` property.
        else if ((match = actionRegex.exec(filePath)) && (_.isFunction(moduleDef) || !_.isUndefined(moduleDef.machine) || !_.isUndefined(moduleDef.friendlyName) || _.isFunction(moduleDef.fn))) {

          // The action identity is the same as the module identity
          // e.g. somefolder/dostuff
          var actionIdentity = match[1].toLowerCase();
          if (actionsLoadedFromDisk[actionIdentity]) {
            throw flaverr({ name: 'userError', code: 'E_CONFLICT', identity: actionIdentity }, new Error('The action `' + _.last(actionIdentity.split('/')) + '` in `' + filePath + '` conflicts with a previously-loaded action.'));
          }

          // Attempt to load the action into our set of actions.
          // This may throw an error, which will be caught below.
          try {
            helpRegisterAction(sails, moduleDef, actionIdentity, true);
          }
          catch (e) {
            switch (e.code) {

              // Improve Error with addtl contextual information about where this action came from.
              case 'E_CONFLICT':
                throw flaverr({ name: 'userError', code: 'E_CONFLICT', identity: actionIdentity }, new Error(
                  'Failed to register `' + _.last(actionIdentity.split('/')) + '`, an action loaded from `'+filePath+'` because it conflicts with a previously-registered action.'
                ));

              default:
                throw e;
            }
          }//</catch>

          // Flag that an action with the given identity was successfully loaded from disk.
          actionsLoadedFromDisk[actionIdentity] = true;

        } // </ is it an action?>

        // Otherwise give up on this file, it's GARBAGE.
        // No, no, it's probably a very nice file but it's
        // no controller as far as we're concerned.
        else {
          garbage.push(filePath);
        } // </ it is garbage>

      }); // </each(file from includeAll)>


      // Complain about garbage.
      if (garbage.length) {
        sails.log.warn('---------------------------------------------------------------------------');
        sails.log.warn('Files in the `controllers` directory may be traditional controllers or \n' +
                     'action files.  Traditional controllers are dictionaries of actions, with \n' +
                     'pascal-cased filenames ending in "Controller" (e.g. MyGreatController.js).\n' +
                     'Action files are kebab-cased (e.g. do-stuff.js) and contain a single action.\n'+
                     'The following file'+(garbage.length > 1 ? 's were' : ' was')+' ignored for not meeting those criteria:');
        _.each(garbage, function(filePath){sails.log.warn('- '+filePath);});
        sails.log.warn('----------------------------------------------------------------------------\n');
      }

      // (Shallow) merge stuff from sails.config.controllers.moduleDefinitions on top of any loaded files.
      // Note that the third argument (force) to `helpRegisterAction` is `true`, so there's no danger
      // of identity conflicts.  Actions defined in `moduleDefinitions` will override anything else.
      _.each(_.get(sails, 'config.controllers.moduleDefinitions') || {}, function(action, actionIdentity) {
        helpRegisterAction(sails, action, actionIdentity, true);
      });

    } catch (e) { return cb(e); }

    // Get a list of the action identities.
    var actionIdentities = _.keys(sails._actions);

    // Flag indicating that warnings were raised (for formatting purposes).
    var raisedWarnings = false;

    // Now that we have all the actions loaded, loop through the registered action middleware
    // and raise a warning about any that don't correspond to a registered action.
    _.each(sails._actionMiddleware, function(fns, target) {
      // Iterate over the list of action globs (e.g. 'foo', 'foo/bar', 'foo/bar/*', '!baz/boop') that a middleware is targeting.
      _.each(_.map(target.split(','), _.trim), function(actionGlob) {
        // Ignore * (it matches everything) and anything starting with '!'
        // (doesn't matter if a middleware is NOT applied to a non-existent action).
        if (actionGlob === '*' || actionGlob[0] === '!') { return; }
        // If the glob doesn't contain a wildcard, and it exactly matches a known action identity, it's ok.
        if (actionGlob.indexOf('*') === -1) {
          if (actionIdentities.indexOf(actionGlob) > -1) { return; }
        }
        // Otherwise, if one of the known action identities would match against the glob, it's okay.
        else {
          var actionGlobWithoutWildcard = actionGlob.replace(/\/\*$/, '');
          if (_.find(actionIdentities, function(actionIdentity) {
            return actionIdentity.indexOf(actionGlobWithoutWildcard) === 0;
          })) {
            return;
          }
        }
        // Otherwise, construct a warning using the _middlewareType properties (if available) of the middleware functions
        // that were mapped to this action glob.
        var warning = 'Action middleware ';
        warning += (function(){
          var fnDescs = _.reduce(fns, function(memo, fn) {
            if (fn._middlewareType) { memo.push(fn._middlewareType); }
            return memo;
          }, []);
          if (fnDescs.length) {
            return '(' + fnDescs.join(', ') + ') ';
          }
          return '';
        })();//†
        warning += 'was bound to a target `' + actionGlob + '` that doesn\'t match any registered actions.';
        sails.log.warn(warning);
        raisedWarnings = true;
      });//∞
    });//∞

    // If we raised any warnings, add an extra line break afterwards.
    if (raisedWarnings) {
      console.log();
    }

    // All done.
    return cb();

  }); // </includeAll>

};
