/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var includeAll = require('include-all');
var Machine = require('machine');



/**
 * loadHelpers()
 *
 * @param {SailsApp} sails
 * @param {Function} cb
 *        @param {Error?} err
 */
module.exports = function loadHelpers(sails, cb) {

  // Load helper defs out of the specified folder
  includeAll.optional({
    dirname: sails.config.paths.helpers,
    filter: /^([^.]+)\.(?:(?!md|txt).)+$/,
    flatten: true,
    keepDirectoryPath: true
  }, function(err, helperDefs) {
    if (err) { return cb(err); }

    // If any helpers were specified when loading Sails, add those on
    // top of the ones loaded from disk.
    if (sails.config.helpers && sails.config.helpers.moduleDefinitions) {
      _.extend(helperDefs, sails.config.helpers.moduleDefinitions);
    }

    // Loop through each helper, attempting to build each one as a machine.
    try {
      _.each(helperDefs, function(helperDef, identity) {
        try {
          // Camel-case every part of the file path, and join with dots
          // e.g. /user-helpers/foo/my-helper => userHelpers.foo.myHelper
          var keyPath = _.map(identity.split('/'), _.camelCase).join('.');
          // Use _.set to set the (possibly nested) property of sails.helpers
          // e.g. sails.helpers.userHelpers.foo.myHelper
          _.set(sails.helpers, keyPath, Machine.build(helperDef));
        }
        // If an error occurs building the machine, throw here to bust
        // out of the _.each loop early
        catch (e) {
          e.code = 'E_FAILED_TO_BUILD_MACHINE';
          e.identity = identity;
          throw e;
        }
      });
    } //</try to build machines>

    // Handle any errors building helper machines by sending them through the
    // hook callback, which will cause Sails to halt lifting.
    catch (e) {
      // Failed to build machine
      if (e.code === 'E_FAILED_TO_BUILD_MACHINE') {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: Instead of this additional log, consider modifying the error itself.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        sails.log.error('Failed to load helper `' + e.identity +'` as a machine!');
        return cb(e);
      }
      // Miscellaneous error
      else { return cb(e); }
    }//</catch error building machines>

    // --• Everthing worked!
    return cb();

  });

};
