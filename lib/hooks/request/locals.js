/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



/**
 * default locals
 *
 * Always share some basic metadata with views.
 * Roughly analogous to `app.locals` in Express.
 *
 * > Application local variables are provided to all templates rendered
 * > within the application. This is useful for providing helper functions
 * > to templates, as well as app-level data.
 * >
 * > http://expressjs.com/api.html#app.locals
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinLocals(req, res) {

  // TODO:
  // Actually take advantage of `app.locals`
  // for this logic.

  // TODO:
  // we might look at pruning the stuff being
  // passed in here, to improve the optimizations
  // of Express's production view cache.

  _.extend(res.locals, {
    _: _,
    session: req.session,
    req: req,
    res: res,
    sails: req._sails
  });

};
