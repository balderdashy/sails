/**
 * sendBuiltinResponse()
 *
 * Terminate a response.
 *
 * @param  {[type]} req     [description]
 * @param  {[type]} res     [description]
 * @param  {[type]} data    [description]
 * @param  {[type]} options [description]
 * @param  {[type]} config  [description]
 *
 * @api private
 */
module.exports = function sendBuiltinResponse (req, res, data, options, config) {

  // Get access to `sails`
  var sails = req._sails;
  config.logMethod = config.logMethod || 'verbose';

  // Log error to console
  if (config.logData && data !== undefined) {
    sails.log[config.logMethod](config.logMessage+': \n', data);
  } else {
    sails.log[config.logMethod](config.logMessage);
  }

  // Set status code
  res.status(config.statusCode);

  if(config.isError) {
    // Only include errors in response if application environment
    // is not set to 'production'.  In production, we shouldn't
    // send back any identifying information about errors.
    if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
      data = undefined;
    }
  }

  // If appropriate, serve data as JSON(P)
  if (req.wantsJSON || sails.config.hooks.views === false) {
    return res.jsonx(data);
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? { view: options } : options || {};

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, { data: data });
  }

  // If no second argument provided, try to serve the implied view,
  // but fall back to sending JSON(P) if no view can be inferred.
  else {
    if(config.isGuessView) {
      return res.guessView({ data: data }, function couldNotGuessView () {
        return res.jsonx(data);
      });
    } else {
      return res.view(config.statusCode, { data: data }, function (err, html) {

        // If a view error occured, fall back to JSON(P).
        if (err) {
          //
          // Additionally:
          // • If the view was missing, ignore the error but provide a verbose log.
          if (err.code === 'E_VIEW_FAILED') {
            sails.log.verbose('res.'+config.name+'() :: Could not locate view for error page (sending JSON instead).  Details: ', err);
          }
          // Otherwise, if this was a more serious error, log to the console with the details.
          else {
            sails.log.warn('res.'+config.name+'() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
          }
          return res.jsonx(data);
        }

        return res.send(html);
      });
    }
  }
};
