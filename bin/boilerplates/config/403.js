/**
 * Default 403 (forbidden) handler
 *
 * This handler can be invoked manually with `res.forbidden()`
 *
 * This handler can be used as a general-purpose handler for your generic "Unauthorized" and/or 
 * "Access Denied" logic.  It allows you to change code in one place and affect this type of logic
 * throughout your app.  Sometimes, you'll want custom 'Forbidden' behavior, and that's fine!
 * This feature is here for convenience in the general case.
 *
 */

module.exports[403] = function badRequest(message, req, res) {

  var result = {
    status: 403
  };

  // Optional message
  if (message) {
    result.message = message;
  }

  // If the user-agent wants a JSON response, send json
  if (req.wantsJSON) {
    return res.json(result, result.status);
  }

  var viewFilePath = '403';
  res.render(viewFilePath, result, function (err) {
    // If the view doesn't exist, or an error occured, send json
    if (err) { return res.json(result, result.status); }
    
    // Otherwise, serve the `views/403.*` page
    res.render(viewFilePath);
  });

};