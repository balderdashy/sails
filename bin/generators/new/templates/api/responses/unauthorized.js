/**
 * 401 (Unauhtorized) Handler
 *
 * Usage:
 * return res.unauthorized('Unauthorized request');
 * 
 * @param {String|Object|Array} message
 *      optional message to inject into view locals or JSON response
 *
 */

module.exports = function unauthorized(message) {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  var viewFilePath = '401';
  var statusCode = 401;

  var result = {
    status: statusCode
  };

  // Optional message
  if (message) {
    result.message = message;
  }

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  // Set status code and view locals
  res.status(result.status);
  for (var key in result) {
    res.locals[key] = result[key];
  }
  // And render view
  res.render(viewFilePath, result, function(err) {
    // If the view doesn't exist, or an error occured, send json
    if (err) {
      return res.json(result, result.status);
    }

    // Otherwise, serve the `views/401.*` page
    res.render(viewFilePath);
  });
};
