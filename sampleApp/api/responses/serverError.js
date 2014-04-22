/**
 * 500 (Server Error) Handler
 * 
 * Usage:
 * return res.serverError(err);
 *
 * @param {Array|Object|String|Error} error(s)     [optional]
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`.
 */

module.exports = function serverError (errors) {

  // Get access to `req`, `res`, `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  var viewFilePath = '500',
    statusCode = 500,
    i, errorToLog, errorToJSON;

  var result = {
    status: statusCode
  };

  // Normalize a {String|Object|Error} or array of {String|Object|Error} 
  // into an array of proper, readable {Error}
  var errorsToDisplay = sails.util.normalizeErrors(errors);
  for (i in errorsToDisplay) {

    // Log error(s) as clean `stack`
    // (avoids ending up with \n, etc.)
    if (errorsToDisplay[i].original) {
      errorToLog = sails.util.inspect(errorsToDisplay[i].original);
    } else {
      errorToLog = errorsToDisplay[i].stack;
    }
    sails.log.error('Server Error (500)');
    sails.log.error(errorToLog);

    // Use original error if it exists
    errorToJSON = errorsToDisplay[i].original || errorsToDisplay[i].message;
    errorsToDisplay[i] = errorToJSON;
  }

  // Only include errors if application environment is set to 'development'
  // In production, don't display any identifying information about the error(s)
  if (sails.config.environment === 'development') {
    result.errors = errorsToDisplay;
  }

  // Set status code
  res.status(result.status);

  // If the user-agent wants JSON, respond with JSON
  if (req.wantsJSON) {
    return res.json(result);
  }


  // Make data more readable for view locals
  var locals = _.mapValues(result, function readabilify(value) {
    if (sails.util.isArray(value)) {
      return _.map(value, sails.util.inspect);
    }
    else if (sails.util.isPlainObject(value)) {
      return sails.util.inspect(value);
    }
    else return value;
  });


  // And try to render view
  res.render(viewFilePath, locals, function(err) {
    // But if the view doesn't exist, or a rendering error occured, just send JSON
    if (err) return res.json(result);

    // Otherwise, if it can be rendered, the `views/500.*` page is rendered
    res.render(viewFilePath, locals);
  });
};
