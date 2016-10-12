/**
 * _mixinReqParam
 *
 * Facade for req.param('sth') with Express4
 * Looking for the param in req.params && req.query && req.body
 *
 * Note: this has to be applied per-route, not per request,
 * in order to refer to the proper route/path parameters
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

module.exports = function _mixinReqParam(req, res) {

  req.param = function(param) {
    return req.params[param] || req.query[param] || (req.body && req.body[param]);
  };

};