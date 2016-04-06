/**
 * Stat view files and expose the existence tree on `sails.views`.
 *
 * @param  {Sails}    sails
 * @param  {Hook}     hook
 * @param  {Function} cb
 *         @param {Error} err
 *         @param {Dictionary} detectedViews
 *
 *
 * @api private
 */

module.exports = function statViews (sails, hook, cb) {
  sails.modules.statViews(function (err, detectedViews) {
    if (err) {
      return cb(err);
    }

    // Save existence tree in `sails.views` for consumption later
    sails.views = detectedViews || {};

    return cb(null, detectedViews);
  });

};
