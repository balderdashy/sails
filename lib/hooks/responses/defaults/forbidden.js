/**
 * Module dependencies
 */

var buildOutletFunction = require('../helpers/build-outlet-function');



/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function forbidden (data, options) {

  var config = {
    logMessage: 'Sending 403 ("Forbidden") response',
    statusCode: 403,
    logData: true,
    isError: true,
    isGuessView: false,
    name: 'forbidden'
  };

  buildOutletFunction(this.req, this.res, data, options, config);

};
