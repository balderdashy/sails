var _ = require('lodash');

/**
 * Load views and generate view-serving middleware for each one
 *
 * @param  {Sails}    sails
 * @param  {Hook}     hook
 * @api private
 */
module.exports = function detectAndPrepareViews (sails, hook) {
  sails.modules.statViews(function (err, detectedViews) {
    if (err) {throw err;}

    // Save existence tree in `sails.views` for consumption later
    sails.views = detectedViews || {};

  });

};
