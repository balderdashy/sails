/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');



/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 *
 * @param  {JSON?} data|err
 * @param  {Ref?} noLongerSupported
 *
 */

module.exports = function serverError (data, noLongerSupported) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // If a second argument was given, log a message.
  if (noLongerSupported) {
    sails.log.debug('The second argument to `res.serverError()` is deprecated.');
    sails.log.debug('To serve a view via `res.serverError()`, override the response');
    sails.log.debug('in \'api/responses/serverError.js\'.\n');
  }

  // Log error to console
  if (!_.isUndefined(data)) {
    sails.log.error('Sending 500 ("Server Error") response: \n', data);
  }

  // Don't output error data with response in production.
  if (sails.config.environment === 'production') {
    data = undefined;
  }

  // Determine the status code to set.
  var statusCodeToSet = res.statusCode || 500;

  // Set status code
  res.status(statusCodeToSet);

  // If appropriate, serve data as JSON.
  if (req.wantsJSON) {
    // If no data was provided, use res.sendStatus().
    if (_.isUndefined(data)) {
      return res.sendStatus(statusCodeToSet);
    }
    // If the data is an error instance and it doesn't have a custom .toJSON(),
    // use its stack instead (otherwise res.json() will turn it into an empty dictionary).
    if (_.isError(data)) {
      if (!_.isFunction(data.toJSON)) {
        data = data.stack;
      }
    }
    return res.json(data);
  }

  return res.view('500', { error: data }, function (err, html) {

    // If a view error occured, fall back to JSON.
    if (err) {
      //
      // Additionally:
      // • If the view was missing, ignore the error but provide a verbose log.
      if (err.code === 'E_VIEW_FAILED') {
        sails.log.verbose('res.serverError() :: Could not locate view for error page (sending JSON instead).  Details: ', err);
      }
      // Otherwise, if this was a more serious error, log to the console with the details.
      else {
        sails.log.warn('res.serverError() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
      }
      return res.json(data);
    }

    return res.send(html);
  });

};
