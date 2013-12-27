/**
 * 404 (Not Found) handler
 *
 * If no route matches are found for a request, Sails will respond using this handler.
 *
 * This middleware can also be invoked manually from a controller or policy:
 * Usage: res.notFound()
 */

module.exports = function notFound() {

  // Get access to `req` and `res`
  var req = this.req;
  var res = this.res;

  var viewFilePath = '404';
  var statusCode = 404;
  var result = {
    status: statusCode
  };

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  res.status(result.status);
  res.render(viewFilePath, function(err) {
    // If the view doesn't exist, or an error occured, send json
    if (err) {
      return res.json(result, result.status);
    }

    // Otherwise, serve the `views/404.*` page
    res.render(viewFilePath);
  });
};
