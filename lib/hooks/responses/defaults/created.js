/**
 * 201 (CREATED) Response
 *
 * Usage:
 * return res.created();
 * return res.created(data);
 * return res.created(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function sendOK (data, options) {

  var config = {
    logMethod: 'silly',
    logMessage: 'res.created() :: Sending 201 ("CREATED") response',
    statusCode: 201,
    logData: false,
    isError: false,
    isGuessView: true
  };

  require('./index').buildResponse(this.req, this.res, data, options, config);

};
