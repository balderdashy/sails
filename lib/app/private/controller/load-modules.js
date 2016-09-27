/**
 * Module dependencies.
 */
var path = require('path');
var _ = require('lodash');
var includeAll = require('include-all');
var sailsUtil = require('sails-util');

module.exports = function (cb) {

  var sails = this;

  sails.config.paths = sails.config.paths || {};
  sails.config.paths.controllers = sails.config.paths.controllers || 'api/controllers';

  // Keep track of actions loaded from disk, so we can detect conflicts.
  var actionsLoadedFromDisk = {};

  // Load all files under the controllers folder.
  includeAll.optional({
    dirname: sails.config.paths.controllers,
    filter: new RegExp('(^.+\\.(?:js)$)'),
    flatten: true,
    keepDirectoryPath: true
  }, function(err, files) {
    if (err) { return cb(err); }
    // Set up a var to hold a list of invalid files.
    var garbage = [];
    // Legacy controllers are PascalCased and end with the word "Controller".
    var legacyRegex = new RegExp('^((?:(?:.*)'+path.sep+')*([0-9A-Z][0-9a-zA-Z_]*))Controller\\..+$');
    // Actions are kebab-cased.
    var actionRegex = new RegExp('^((?:(?:.*)'+path.sep+')*([a-z][a-z0-9-]*))\\..+$');
    try {
      // Loop through all of the files returned from include-all.
      _.each(files, function(module) {
        var filePath = module.globalId;
        var identity = '';
        // Attempt to match the file path to the pattern of a legacy controller file.
        var match = legacyRegex.exec(filePath);
        // Is it a legacy controller?
        if (match) {
          // If it looks like a legacy controller, but it's not a dictionary,
          // throw it in the can.
          if (!sailsUtil.isDictionary(module)) {
            return garbage.push(filePath);
          }
          // Get the controller identity (e.g. /somefolder/somecontroller)
          identity = match[1];
          // Loop through each action in the controller file's dictionary.
          _.each(module, function(action, actionName) {
            // Ignore strings (this could be the "identity" property of a module).
            if (_.isString(action)) {return;}
            // The action identity is the controller identity + the action name,
            // with path separators transformed to dots.
            // e.g. somefolder.somecontroller.dostuff
            var actionIdentity = (identity + path.sep + actionName).toLowerCase().replace((new RegExp(path.sep,'g')), '.');
            // If the action identity matches one we've already loaded from disk, bail.
            if (actionsLoadedFromDisk[actionIdentity]) {
              var conflictError = new Error('The action `' + actionName + '` in `' + filePath + '` conflicts with a previously-loaded action.');
              conflictError.code = 'E_CONFLICT';
              conflictError.identity = actionIdentity;
              throw conflictError;
            }
            // Attempt to load the action into our set of actions.
            // This may throw an error, which will be caught below.
            sails._controller.registerAction(action, actionIdentity, true);
            // Flag that an action with the given identity was successfully loaded from disk.
            actionsLoadedFromDisk[actionIdentity] = true;
          });
        } // </ is it a legacy controller? >

        // Okay, it's not a legacy controller.  Is it an action?
        // Attempt to match the file path to the pattern of an action file,
        // and make sure it is either a function OR a dictionary containing
        // a function as its `fn` property.
        else if ((match = actionRegex.exec(filePath)) && (_.isFunction(module) || !_.isUndefined(module.machine) || !_.isUndefined(module.friendlyName) || _.isFunction(module.fn))) {
          // The action identity is the same as the module identity
          // e.g. somefolder.dostuff
          var actionIdentity = match[1].toLowerCase().replace((new RegExp(path.sep,'g')), '.');
          if (actionsLoadedFromDisk[actionIdentity]) {
            var conflictError = new Error('The action `' + _.last(actionIdentity.split('.')) + '` in `' + filePath + '` conflicts with a previously-loaded action.');
            conflictError.code = 'E_CONFLICT';
            conflictError.identity = actionIdentity;
            throw conflictError;
          }
          // Attempt to load the action into our set of actions.
          // This may throw an error, which will be caught below.
          sails._controller.registerAction(module, actionIdentity, true);
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

    // If any errors were thrown above (probably in the `loadAction` calls),
    // we'll catch them here.
    } catch (e) { return cb(e); }

    // Complain about garbage.
    if (garbage.length) {
      sails.log.warn('---------------------------------------------------------------------------');
      sails.log.warn('Files in the `controllers` directory may be legacy controllers or \n' +
                   'action files.  Legacy controllers are dictionaries of actions, with \n' +
                   'pascal-cased filenames ending in "Controller" (e.g. MyGreatController.js).\n' +
                   'Action files are kebab-cased (e.g. do-stuff.js) and contain a single action.\n'+
                   'The following file'+(garbage.length > 1 ? 's were' : ' was')+' ignored for not meeting those criteria:');
      _.each(garbage, function(filePath){sails.log.warn('- '+filePath);});
      sails.log.warn('----------------------------------------------------------------------------\n');
    }

    // Merge stuff from sails.config.controllers.actions on top of any loaded files.
    _.each(_.get(sails, 'config.controllers.actions') || {}, function(action, actionIdentity) {
      sails._controller.registerAction(action, actionIdentity, true);
    });

    return cb();

  }); // </includeAll>

};
