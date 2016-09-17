/**
 * Module dependencies.
 */

var path = require('path');
var _ = require('lodash');
var includeAll = require('include-all');
var sailsUtil = require('sails-util');
var toInterpretRouteSyntax = require('./to-interpret-route-syntax');
var loadAction = require('./load-action');


/**
 * `controllers` (Core Hook)
 */
module.exports = function(sails) {


  return {


    /**
     * Implicit defaults which will be merged into sails.config before this hook is loaded...
     * @type {Dictionary}
     */
    defaults: {},


    /**
     * Before any hooks have begun loading...
     * (called automatically by Sails core)
     */
    configure: function() {
      // This initial setup of `sails.controllers` was included here as an experimental
      // feature so that these modules would be accessible for other hooks.  This will be
      // deprecated in Sails v1.0 in favor of the ability for hook authors to register or unregister
      // controllers programatically.  In addition, controllers will no longer be exposed
      // on the `sails` app instance.
      sails.controllers = {};
    },


    /**
     * When the hook is loaded...
     * (called automatically by Sails core)
     */
    initialize: function(cb) {

      // In future versions of Sails, the empty registry of controllers can be initialized here:
      // sails.controllers = {};

      // Register route syntax for binding controllers.
      var interpretRouteSyntax = toInterpretRouteSyntax(sails);
      sails.on('route:typeUnknown', interpretRouteSyntax);

      return cb();

    },


    loadModules: function(cb) {

      // Clear all actions from the hook.
      sails.hooks.controllers._actions = {};

      // Load all files under the controllers folder.
      includeAll.optional({
        dirname: sails.config.paths.controllers,
        filter: new RegExp('(^.+\\.(?:' + sails.config.moduleloader.sourceExt.join('|') + ')$)'),
        flatten: true,
        keepDirectoryPath: true
      }, function(err, files) {
        if (err) { return cb(err); }
        // Set up a var to hold a list of invalid files.
        var garbage = [];
        // Legacy controllers are PascalCased and end with the word "Controller".
        var legacyRegex = new RegExp('^((?:(?:.*)'+path.sep+')*([0-9A-Z][0-9a-zA-Z_]*))Controller\\.(' + sails.config.moduleloader.sourceExt.join('|') + ')$');
        // Actions are kebab-cased.
        var actionRegex = new RegExp('^((?:(?:.*)'+path.sep+')*([a-z][a-z0-9-]*))\\.(' + sails.config.moduleloader.sourceExt.join('|') + ')$');
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
                // The action identity is the controller identity + the action name,
                // with path separators transformed to dots.
                // e.g. somefolder.somecontroller.dostuff
                var actionIdentity = (identity + path.sep + actionName).toLowerCase().replace((new RegExp(path.sep,'g')), '.');
                // Attempt to load the action into our set of actions.
                // This may throw an error, which will be caught below.
                loadAction(action, actionIdentity, actionName, filePath);
              });
            } // </ is it a legacy controller? >

            // Okay, it's not a legacy controller.  Is it an action?
            // Attempt to match the file path to the pattern of an action file,
            // and make sure it is either a function OR a dictionary containing
            // a function as its `fn` property.
            else if ((match = actionRegex.exec(filePath)) && (_.isFunction(module) || _.isFunction(module.fn))) {
              // The action identity is the same as the module identity
              // e.g. somefolder.dostuff
              var actionIdentity = match[1].toLowerCase().replace((new RegExp(path.sep,'g')), '.');
              // Attempt to load the action into our set of actions.
              // This may throw an error, which will be caught below.
              loadAction(module, actionIdentity, _.last(actionIdentity.split('.')), filePath);
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
          console.warn('----------------------------------------------------------------------------');
          console.warn('Files in the `controllers` directory may be legacy controllers or \n' +
                       'action files.  Legacy controllers are dictionaries of actions, with \n' +
                       'pascal-cased filenames ending in "Controller" (e.g. MyGreatController.js).\n' +
                       'Action files are kebab-cased (e.g. do-stuff.js) and contain a single action.\n'+
                       'The following file'+(garbage.length > 1 ? 's were' : ' was')+' ignored for not meeting those criteria:');
          _.each(garbage, function(filePath){console.warn('- '+filePath);});
          console.warn('----------------------------------------------------------------------------\n');
        }

        return cb();

      }); // </includeAll>

    }


  };
};
