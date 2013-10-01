/**
 * Default 500 (Server Error) middleware
 *
 * If an error is thrown in a policy or controller, 
 * Sails will respond using this default error handler
 *
 * This middleware can also be invoked manually from a controller or policy:
 * res.serverError( [errors] )
 *
 *
 * @param {Array|Object|String} errors
 *      optional errors
 */

module.exports[500] = function serverErrorOccurred(errors, req, res) {

  /*
   * NOTE: This function is Sails middleware-- that means that not only do `req` and `res`
   * work just like their Express equivalents to handle HTTP requests, they also simulate
   * the same interface for receiving socket messages.
   */

  var viewFilePath = '500';
  var statusCode = 500;

  var result = {
    status: statusCode
  };

  // Normalize a {String|Object|Error} or array of {String|Object|Error} 
  // into an array of proper, readable {Error}
  var errorsToDisplay = sails.util.normalizeErrors(errors);

  // Log error(s)
  for (var e in errorsToDisplay) {
    sails.log.error('Server (500)',errorsToDisplay[e].stack);
  }

  // Only include errors if application environment is set to 'development'
  // In production, don't display any identifying information about the error(s)
  if (sails.config.environment === 'development') {
    result.errors = errorsToDisplay;
  }

  // If the user-agent wants JSON, respond with JSON
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  // Set status code and view locals
  res.status(result.status);
  for (var key in result) {
    res.locals[key] = result[key];
  }
  // And render view
  res.render(viewFilePath, result, function (err) {
    // If the view doesn't exist, or an error occured, just send JSON
    if (err) { return res.json(result, result.status); }
    
    // Otherwise, if it can be rendered, the `views/500.*` page is rendered
    res.render(viewFilePath, result);
  });

};