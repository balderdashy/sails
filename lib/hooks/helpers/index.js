/**
 * Module dependencies
 */

var loadHelpers = require('./private/load-helpers');


/**
 * Helpers hook
 */

module.exports = function(sails) {

  return {


    defaults: {
      helpers: {
        moduleDefinitions: undefined,// « can be set to a dictionary of helpers (experimental)
      }
    },


    configure: function() {

      // Define `sails.helpers` here so that it can potentially be used by other hooks.
      // > NOTE: This is NOT `sails.config.helpers`-- this is `sails.helpers`!
      // > (As for sails.config.helpers, it's set automatically based on our `defaults above)
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
          sails.log.error('Could not reload helpers due to an error:', err, '\n(continuing anyway...)');
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
