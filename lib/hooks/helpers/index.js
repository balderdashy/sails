/**
 * Module dependencies
 */

var loadHelpers = require('./private/load-helpers');


/**
 * Helpers hook
 */

module.exports = function(sails) {

  return {

    /**
     * Before any hooks have begun loading...
     * (called automatically by Sails core)
     */
    configure: function() {

      // Define `sails.helpers` here so that it can potentially be used by other hooks.
      sails.helpers = {};

    },


    initialize: function(done) {

      // Load helpers from the specified folder
      loadHelpers(sails, done);

    },


    /**
     * sails.hooks.helpers.reload()
     *
     * @param  {Dictionary?}   helpers [if specified, these helpers will replace all existing helpers.  Otherwise, if omitted, helpers will be freshly reloaded from disk, and old helpers will be thrown away.]
     * @param  {Function} done    [optional callback]
     *
     * @experimental
     */
    reload: function(helpers, done) {

      // Handle variadic usage
      if (typeof helpers === 'function') {
        done = helpers;
        helpers = undefined;
      }

      // Handle optional callback
      done = done || function _noopCb(err){
        if (err) {
          sails.log.error('Could not reload helpers due to an error:', err);
          sails.log.error('(continuing anyway...)');
        }
      };//ƒ

      // If we received an explicit set of helpers to load, use them.
      // Otherwise reload helpers from disk.
      if (helpers) {
        sails.helpers = helpers;
        return done();
      } else {
        return loadHelpers(sails, done);
      }
    }//ƒ


  };

};
