/**
 * Module dependencies
 */

var flaverr = require('flaverr');



/**
 * Mixes in `req.validate`.
 *
 * @param  {Request} req
 * @param  {Response} res
 * @return {Request}
 *
 * Note that built-in support for req.validate() has changed in Sails v1.0
 * (alongwith other major changes to `anchor`.)
 */
module.exports = function (req /*, res */) {

  /**
   * req.validate()
   *
   * @param  {Object} usage
   *         (supports either `{type: {}}` or `{}`)
   *
   * @param  {String} redirectTo
   *         (optional)
   *
   * @throws {Error}
   * @api deprecated
   */

  req.validate = function (/* usage, redirectTo */) {
    throw flaverr({ code: 'E_REQ_VALIDATE_UNSUPPORTED' }, new Error('As of Sails v1, `req.validate` is no longer supported.  Instead use actions2: http://sailsjs.com/docs/concepts/controllers'));
  };//</function definition :: req.validate>

  return req;
};
