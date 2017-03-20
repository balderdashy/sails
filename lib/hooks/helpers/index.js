/**
 * Module dependencies
 */

var loadHelpers = require('./load-helpers');


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
      sails.helpers = {};
    },


    initialize: function(cb) {

      // Load helpers from the specified folder
      loadHelpers.apply(this, [sails, cb]);

    },

    reload: function(helpers, cb) {

      if (typeof helpers === 'function') {
        cb = helpers;
        helpers = null;
      }

      // If we received an explicit set of helpers to load, use them.
      if (helpers) {
        sails.helpers = helpers;
        return;
      }
      // Otherwise reload helpers from disk.
      loadHelpers.apply(this, [sails, function(err) {
        if (cb) {
          return cb(err);
        }
        if (err) {
          throw err;
        }
      }]);
    }


  };

};
