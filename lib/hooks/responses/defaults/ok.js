/**
 * Module dependencies
 */

var sendBuiltinResponse = require('../helpers/build-outlet-function');



/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function sendOK (data, options) {

  var config = {
    logMethod: 'silly',
    logMessage: 'res.ok() :: Sending 200 ("OK") response',
    statusCode: 200,
    logData: false,
    isError: false,
    isGuessView: true
  };

  sendBuiltinResponse(this.req, this.res, data, options, config);

};
