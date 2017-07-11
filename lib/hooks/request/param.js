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

module.exports = function _mixinReqParam(req /*, res */) {

  req.param = function(param, defaultValue) {
    // If the param exists as a route param, use it.
    if (typeof req.params[param] !== 'undefined') {
      return req.params[param];
    }
    // If the param exists as a body param, use it.
    if (req.body && typeof req.body[param] !== 'undefined') {
      return req.body[param];
    }
    // Return the query param, if it exists.
    return typeof req.query[param] !== 'undefined' ? req.query[param] : defaultValue;
  };

};
