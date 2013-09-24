/**
 * Default 404 (not found) handler
 *
 * If no matches are found, Sails will respond using this handler:
 *
 * For more information on 404/notfound handling in Sails/Express, check out:
 * http://expressjs.com/faq.html#404-handling
 */

module.exports[404] = function pageNotFound(message, req, res) {

  var statusCode = 404;
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

  var viewFilePath = '404';
  res.render(viewFilePath, result, function (err) {
    // If the view doesn't exist, or an error occured, send json
    if (err) { return res.json(result, result.status); }

    // Otherwise, serve the `views/404.*` page
    res.render(viewFilePath);
  });

};