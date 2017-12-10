/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
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

    try {
      // Loop through each helper def, attempting to build each one as
      // a Callable (a.k.a. "wet machine")
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
          throw flaverr({
            code: 'E_FAILED_TO_BUILD_CALLABLE',
            identity: identity,
            raw: err
          }, err);
        }
      });//∞

    } catch (err) {

      // Handle any errors building Callables for our helpers by sending the
      // errors through the hook callback, which will cause Sails to halt lifting.
      if (flaverr.taste('E_FAILED_TO_BUILD_CALLABLE', err)) {
        return done(flaverr({
          message: 'Failed to load helper `' + err.identity +'` into a Callable!  '+err.message
        }, err));
      } else {
        return done(err);
      }

    }//</ caught >

    // --• Everthing worked!
    return done();

  });

};
