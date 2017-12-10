/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var includeAll = require('include-all');
var Machine = require('machine');



/**
 * loadHelpers()
 *
 * Load helper definitions from disk, build them into Callables, then attach
 * them to the `sails.helpers` dictionary.
 *
 * @param {SailsApp} sails
 * @param {Function} done
 *        @param {Error?} err
 */
module.exports = function loadHelpers(sails, done) {

  // Load helper defs out of the specified folder
  includeAll.optional({
    dirname: sails.config.paths.helpers,
    filter: /^([^.]+)\.(?:(?!md|txt).)+$/,
    flatten: true,
    keepDirectoryPath: true
  }, function(err, helperDefs) {
    if (err) { return done(err); }

    // If any helpers were specified when loading Sails, add those on
    // top of the ones loaded from disk.  (Experimental)
    if (sails.config.helpers && sails.config.helpers.moduleDefinitions) {
      // TODO: Reconsider how this is done to allow more flexibility in configuration.d
      _.extend(helperDefs, sails.config.helpers.moduleDefinitions);
    }

    // Loop through each helper def, attempting to build each one as
    // a Callable (a.k.a. "wet machine")
    try {
      _.each(helperDefs, function(helperDef, identity) {
        try {
          // Camel-case every part of the file path, and join with dots
          // e.g. /user-helpers/foo/my-helper => userHelpers.foo.myHelper
          var keyPath = _.map(identity.split('/'), _.camelCase).join('.');

          // Use filename-derived `identity` if no other, better identity can be derived.
          // (Otherwise, as of machine@v15, this fails with an ImplementationError.)
          if (!helperDef.identity && !helperDef.friendlyName && !helperDef.description) {
            helperDef.identity = identity;
          }

          // Use _.set to set the (possibly nested) property of sails.helpers
          // e.g. sails.helpers.userHelpers.foo.myHelper
          _.set(sails.helpers, keyPath, Machine.build(helperDef));
        } catch (err) {
          // If an error occurs building the callable, throw here to bust
          // out of the _.each loop early
          err.code = 'E_FAILED_TO_BUILD_MACHINE';
          err.identity = identity;
          throw err;
        }
      });//∞
    } catch (err) { //</tried to build callables>
      // Handle any errors building Callables for our helpers by sending the
      // errors through the hook callback, which will cause Sails to halt lifting.
      if (err.code === 'E_FAILED_TO_BUILD_MACHINE') {
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: Instead of this additional log, consider modifying the error itself.
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        sails.log.error('Failed to load helper `' + err.identity +'` into a Callable!');
        return done(err);
      } else {
        return done(err);
      }
    }//</caught error building callables>

    // --• Everthing worked!
    return done();

  });

};
