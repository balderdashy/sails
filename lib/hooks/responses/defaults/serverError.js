/**
 * Module dependencies
 */

var sendBuiltinResponse = require('../helpers/build-outlet-function');



/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, 'some/specific/error/view');
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

module.exports = function serverError (data, options) {

  var config = {
    logMethod: 'error',
    logMessage: 'Sending 500 ("Server Error") response',
    statusCode: 500,
    logData: true,
    isError: true,
    isGuessView: false,
    name: 'serverError'
  };

  sendBuiltinResponse(this.req, this.res, data, options, config);

};
