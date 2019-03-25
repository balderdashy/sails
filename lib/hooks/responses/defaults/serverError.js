/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');



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

module.exports = function serverError (data) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  // Get access to `sails`
  var sails = req._sails;

  // Log error to console
  if (data !== undefined) {
    sails.log.error('Sending 500 ("Server Error") response: \n', flaverr.parseError(data) || data);
  }

  // Don't output error data with response in production.
  var dontRevealErrorInResponse = process.env.NODE_ENV === 'production';
  if (dontRevealErrorInResponse) {
    data = undefined;
  }

  // Set status code
  res.status(500);

  // If appropriate, serve data as JSON.
  if (req.wantsJSON || !res.view) {
    // If no data was provided, use res.sendStatus().
    if (data === undefined) {
      return res.sendStatus(500);
    }
    // If the data is an error instance and it doesn't have a custom .toJSON(),
    // use its stack instead (otherwise res.json() will turn it into an empty dictionary).
    if (_.isError(data)) {
      if (!_.isFunction(data.toJSON)) {
        data = data.stack;
        // No need to stringify the stack (it's already a string).
        return res.send(data);
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
        sails.log.verbose(
          'res.serverError() :: Could not locate view for error page'+
          (dontRevealErrorInResponse? '':' (sending JSON instead)')+'.  '+
          'Details: ', err
        );
      }
      // Otherwise, if this was a more serious error, log to the console with the details.
      else {
        sails.log.warn(
          'res.serverError() :: When attempting to render error page view, '+
          'an error occured'+(dontRevealErrorInResponse? '':' (sending JSON instead)')+'.  '+
          'Details: ', err
        );
      }
      return res.json(data);
    }

    return res.send(html);
  });

};
